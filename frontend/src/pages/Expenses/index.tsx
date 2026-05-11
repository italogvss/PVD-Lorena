import { FC, useCallback, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ExpenseFormModal from '../../components/ui/ExpenseFormModal';
import { useExpense } from '../../hooks/useExpense';
import { useToast } from '../../hooks/useToast';
import type { CreateExpenseRequest, Expense, UpdateExpenseRequest } from '../../types';
import { formatBRL } from '../../utils/currency';
import { formatDate } from '../../utils/date';

const now = new Date();

const ExpensesPage: FC = () => {
  const { loading, getAll, getRecurring, create, update, markAsPaid, remove } = useExpense();
  const { showToast } = useToast();

  const [tab, setTab] = useState(0);

  // History state
  const [rows, setRows] = useState<Expense[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  // Recurring state
  const [recurring, setRecurring] = useState<Expense[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Confirm delete state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await getAll({ page: page + 1, pageSize, month: filterMonth, year: filterYear });
      if (res) {
        setRows(res.data);
        setTotalCount(res.totalCount);
      }
    } catch {
      showToast('Erro ao carregar histórico de despesas.', 'error');
    }
  }, [page, pageSize, filterMonth, filterYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRecurring = useCallback(async () => {
    try {
      const res = await getRecurring();
      if (res) setRecurring(res);
    } catch {
      showToast('Erro ao carregar despesas recorrentes.', 'error');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    loadRecurring();
  }, [loadRecurring]);

  const handleCreate = async (data: CreateExpenseRequest | UpdateExpenseRequest) => {
    try {
      await create(data as CreateExpenseRequest);
      showToast('Despesa cadastrada com sucesso.', 'success');
      setModalOpen(false);
      loadHistory();
      loadRecurring();
    } catch {
      showToast('Erro ao cadastrar despesa.', 'error');
    }
  };

  const handleUpdate = async (data: CreateExpenseRequest | UpdateExpenseRequest) => {
    if (!editingExpense) return;
    try {
      await update(editingExpense.id, data as UpdateExpenseRequest);
      showToast('Despesa atualizada com sucesso.', 'success');
      setModalOpen(false);
      setEditingExpense(null);
      loadHistory();
      loadRecurring();
    } catch {
      showToast('Erro ao atualizar despesa.', 'error');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await markAsPaid(id);
      showToast('Despesa marcada como paga.', 'success');
      loadHistory();
      loadRecurring();
    } catch {
      showToast('Erro ao marcar despesa como paga.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await remove(deletingId);
      showToast('Despesa removida com sucesso.', 'success');
      setConfirmOpen(false);
      setDeletingId(null);
      loadHistory();
      loadRecurring();
    } catch {
      showToast('Erro ao remover despesa.', 'error');
    }
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'description',
      headerName: 'Descrição',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'amount',
      headerName: 'Valor',
      width: 130,
      renderCell: params => formatBRL(params.value),
    },
    {
      field: 'dueDate',
      headerName: 'Vencimento',
      width: 130,
      renderCell: params => formatDate(params.value),
    },
    {
      field: 'isRecurring',
      headerName: 'Recorrente',
      width: 110,
      renderCell: params =>
        params.value ? (
          <Chip label="Sim" color="info" size="small" icon={<AutorenewIcon />} />
        ) : (
          <Chip label="Não" size="small" />
        ),
    },
    {
      field: 'isPaid',
      headerName: 'Status',
      width: 120,
      renderCell: params =>
        params.value ? (
          <Chip label="Paga" color="success" size="small" />
        ) : (
          <Chip label="Pendente" color="warning" size="small" />
        ),
    },
    {
      field: 'paidAt',
      headerName: 'Paga em',
      width: 130,
      renderCell: params => (params.value ? formatDate(params.value) : '—'),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 140,
      sortable: false,
      renderCell: params => {
        const expense: Expense = params.row;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
            {!expense.isPaid && (
              <Tooltip title="Marcar como paga">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleMarkAsPaid(expense.id)}
                  disabled={loading === 'pay'}
                >
                  <AttachMoneyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Editar">
              <IconButton size="small" color="primary" onClick={() => openEdit(expense)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover">
              <IconButton size="small" color="error" onClick={() => openDelete(expense.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Despesas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingExpense(null); setModalOpen(true); }}
        >
          Adicionar
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Recorrentes" />
        <Tab label="Histórico do Mês" />
      </Tabs>

      {/* --- Recorrentes Tab --- */}
      {tab === 0 && (
        <Box>
          {loading === 'fetchRecurring' ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : recurring.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Nenhuma despesa recorrente pendente.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {recurring.map(exp => (
                <Card key={exp.id} sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '12px !important' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {exp.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vencimento: {formatDate(exp.dueDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="warning.main">
                        {formatBRL(exp.amount)}
                      </Typography>
                      <Tooltip title="Marcar como paga">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleMarkAsPaid(exp.id)}
                          disabled={loading === 'pay'}
                        >
                          <AttachMoneyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => openEdit(exp)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover">
                        <IconButton size="small" color="error" onClick={() => openDelete(exp.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* --- Histórico Tab --- */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box
              component="select"
              value={filterMonth}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFilterMonth(Number(e.target.value));
                setPage(0);
              }}
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                fontSize: '0.875rem',
              }}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Box>
            <Box
              component="select"
              value={filterYear}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFilterYear(Number(e.target.value));
                setPage(0);
              }}
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                fontSize: '0.875rem',
              }}
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Box>
          </Box>

          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading === 'fetch'}
            rowCount={totalCount}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={model => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            pageSizeOptions={[10, 20, 50]}
            autoHeight
            disableRowSelectionOnClick
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>
      )}

      <ExpenseFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExpense(null); }}
        onSubmit={editingExpense ? handleUpdate : handleCreate}
        expense={editingExpense}
        loading={loading === 'create' || loading === 'update'}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Remover Despesa"
        message="Tem certeza que deseja remover esta despesa? Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </Box>
  );
};

export default ExpensesPage;
