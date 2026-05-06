import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import BarChartIcon from '@mui/icons-material/BarChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
} from '@mui/x-data-grid';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useSale } from '../../hooks/useSale';
import { useToast } from '../../hooks/useToast';
import type { Sale, SaleDetail, SaleStatus } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';

const PAYMENT_LABELS: Record<string, string> = {
  Cash: 'Dinheiro',
  PIX: 'PIX',
  'Credit Card': 'Crédito',
  'Debit Card': 'Débito',
};

const SalesPage: FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const { loading, getAll, getById, cancel } = useSale();

  const [sales, setSales] = useState<Sale[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [statusFilter, setStatusFilter] = useState<'' | SaleStatus>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<SaleDetail | null>(null);
  const [detailFetching, setDetailFetching] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAll({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: statusFilter || undefined,
    })
      .then(result => {
        if (!cancelled && result) {
          setSales(result.data);
          setTotalCount(result.totalCount);
        }
      })
      .catch(() => {
        if (!cancelled) showToast('Erro ao carregar vendas.', 'error');
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, statusFilter, startDate, endDate, refreshToken]);

  const handleViewDetail = async (sale: Sale) => {
    setDetailOpen(true);
    setSelectedDetail(null);
    setDetailFetching(true);
    try {
      const detail = await getById(sale.id);
      setSelectedDetail(detail ?? null);
    } catch {
      showToast('Erro ao carregar detalhes da venda.', 'error');
      setDetailOpen(false);
    } finally {
      setDetailFetching(false);
    }
  };

  const handleRequestCancel = (sale: Sale) => {
    setSaleToCancel(sale);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!saleToCancel) return;
    try {
      await cancel(saleToCancel.id);
      showToast('Venda cancelada. Estoque restaurado.', 'success');
      setConfirmOpen(false);
      setSaleToCancel(null);
      setDetailOpen(false);
      setSelectedDetail(null);
      setRefreshToken(t => t + 1);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast(detail ?? 'Erro ao cancelar venda.', 'error');
    }
  };

  const actionColumn: GridColDef[] = [
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 80,
      getActions: (params: GridRowParams<Sale>) => {
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label="Ver detalhes"
            onClick={() => handleViewDetail(params.row)}
          />,
        ];
        if (isAdmin && params.row.status === 'Active') {
          actions.push(
            <GridActionsCellItem
              key="cancel"
              icon={<BlockIcon color="error" />}
              label="Cancelar venda"
              onClick={() => handleRequestCancel(params.row)}
            />,
          );
        }
        return actions;
      },
    },
  ];

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Data',
      width: 160,
      sortable: false,
      renderCell: ({ value }) => formatDateTime(value as string),
    },
    {
      field: 'operatorName',
      headerName: 'Operador',
      flex: 1,
      minWidth: 140,
      sortable: false,
    },
    {
      field: 'customerName',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: ({ value }) => (value as string) || '—',
    },
    {
      field: 'paymentMethod',
      headerName: 'Pagamento',
      width: 130,
      sortable: false,
      renderCell: ({ value }) => PAYMENT_LABELS[value as string] ?? value,
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      sortable: false,
      renderCell: ({ value }) => formatBRL(value as number),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: false,
      renderCell: ({ value }) => (
        <Chip
          label={value === 'Active' ? 'Ativa' : 'Cancelada'}
          color={value === 'Active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    ...actionColumn,
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Vendas</Typography>
        <Button
          variant="outlined"
          startIcon={<BarChartIcon />}
          onClick={() => navigate('/reports')}
        >
          Ver gráfico
        </Button>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <TextField
          label="Data início"
          type="date"
          size="small"
          value={startDate}
          onChange={e => { setStartDate(e.target.value); setPaginationModel(p => ({ ...p, page: 0 })); }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 180 }}
        />
        <TextField
          label="Data fim"
          type="date"
          size="small"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); setPaginationModel(p => ({ ...p, page: 0 })); }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 180 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={e => { setStatusFilter(e.target.value as '' | SaleStatus); setPaginationModel(p => ({ ...p, page: 0 })); }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Active">Ativas</MenuItem>
            <MenuItem value="Cancelled">Canceladas</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* DataGrid */}
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={sales}
          columns={columns}
          rowCount={totalCount}
          loading={loading === 'fetch'}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={model => setPaginationModel(model)}
          pageSizeOptions={[10, 20, 50]}
          disableColumnFilter
          disableColumnMenu
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
            '& .MuiDataGrid-footerContainer': { borderTop: 1, borderColor: 'divider' },
          }}
          localeText={{
            noRowsLabel: 'Nenhuma venda encontrada.',
            footerRowSelected: count => `${count} selecionado(s)`,
          }}
        />
      </Box>

      {/* Detail modal */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Detalhes da Venda
          {selectedDetail && (
            <Chip
              label={selectedDetail.status === 'Active' ? 'Ativa' : 'Cancelada'}
              color={selectedDetail.status === 'Active' ? 'success' : 'default'}
              size="small"
            />
          )}
        </DialogTitle>

        <DialogContent dividers>
          {detailFetching || !selectedDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Header info */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <InfoRow label="Data" value={formatDateTime(selectedDetail.createdAt)} />
                <InfoRow label="Operador" value={selectedDetail.operatorName} />
                <InfoRow label="Cliente" value={selectedDetail.customerName ?? '—'} />
                <InfoRow label="Pagamento" value={PAYMENT_LABELS[selectedDetail.paymentMethod] ?? selectedDetail.paymentMethod} />
                {selectedDetail.isInstallment && selectedDetail.installmentCount && (
                  <InfoRow
                    label="Parcelas"
                    value={`${selectedDetail.installmentCount}× de ${formatBRL(selectedDetail.installmentValue ?? 0)}`}
                  />
                )}
                {selectedDetail.status === 'Cancelled' && selectedDetail.cancelledAt && (
                  <InfoRow label="Cancelada em" value={formatDateTime(selectedDetail.cancelledAt)} />
                )}
              </Box>

              <Divider />

              {/* Items */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
                  Itens
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Qtd.</TableCell>
                      <TableCell align="right">Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDetail.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatBRL(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatBRL(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Divider />

              {/* Totals */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Typography color="text.secondary">Total</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatBRL(selectedDetail.total)}</Typography>
                </Box>
                {selectedDetail.paymentMethod === 'Cash' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Typography color="text.secondary">Valor pago</Typography>
                      <Typography>{formatBRL(selectedDetail.amountPaid)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Typography color="text.secondary">Troco</Typography>
                      <Typography>{formatBRL(selectedDetail.change)}</Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Box>
            {isAdmin && selectedDetail?.status === 'Active' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => { if (selectedDetail) handleRequestCancel(selectedDetail as unknown as Sale); }}
                disabled={loading === 'cancel'}
              >
                Cancelar Venda
              </Button>
            )}
          </Box>
          <Button onClick={() => setDetailOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm cancel */}
      <ConfirmDialog
        open={confirmOpen}
        title="Cancelar venda"
        message={`Tem certeza que deseja cancelar esta venda? O estoque dos itens será restaurado automaticamente.`}
        confirmLabel="Cancelar Venda"
        loadingLabel="Cancelando..."
        onConfirm={handleConfirmCancel}
        onCancel={() => { setConfirmOpen(false); setSaleToCancel(null); }}
        loading={loading === 'cancel'}
      />
    </Box>
  );
};

const InfoRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
      {value}
    </Typography>
  </Box>
);

export default SalesPage;
