import { FC, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ProductFormModal from '../../components/ui/ProductFormModal';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowParams,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useProduct } from '../../hooks/useProduct';
import { useToast } from '../../hooks/useToast';
import type { Product } from '../../types';
import { formatBRL } from '../../utils/currency';

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Nome: A-Z' },
  { value: 'name_desc', label: 'Nome: Z-A' },
  { value: 'price_asc', label: 'Preço: Menor' },
  { value: 'price_desc', label: 'Preço: Maior' },
  { value: 'stock_asc', label: 'Estoque: Menor' },
  { value: 'stock_desc', label: 'Estoque: Maior' },
];

const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set<GridRowId>() };

const StockPage: FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const { loading, getAll, remove, removeMany } = useProduct();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortValue, setSortValue] = useState('name_asc');
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const [sortBy, sortOrder] = sortValue.split('_') as [string, 'asc' | 'desc'];
    let cancelled = false;

    getAll({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      name: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    })
      .then(result => {
        if (!cancelled && result) {
          setProducts(result.data);
          setTotalCount(result.totalCount);
        }
      })
      .catch(() => {
        if (!cancelled) showToast('Erro ao carregar estoque.', 'error');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch, sortValue, refreshToken]);

  const handleSortChange = (value: string) => {
    setSortValue(value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const openConfirm = (ids: string[]) => {
    setPendingIds(ids);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (pendingIds.length === 1) {
        await remove(pendingIds[0]);
      } else {
        await removeMany(pendingIds);
      }
      showToast(
        pendingIds.length === 1 ? 'Produto excluído com sucesso.' : `${pendingIds.length} produtos excluídos.`,
        'success',
      );
      setSelectionModel(EMPTY_SELECTION);
      setConfirmOpen(false);
      setRefreshToken(t => t + 1);
    } catch {
      showToast('Erro ao excluir produto(s).', 'error');
    }
  };

  const actionColumn: GridColDef[] = isAdmin
    ? [
        {
          field: 'actions',
          type: 'actions',
          headerName: '',
          width: 80,
          getActions: (params: GridRowParams<Product>) => [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Editar"
              onClick={() => { setEditProduct(params.row); setModalOpen(true); }}
            />,
            <GridActionsCellItem
              icon={<DeleteIcon color="error" />}
              label="Excluir"
              onClick={() => openConfirm([params.row.id])}
            />,
          ],
        },
      ]
    : [];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180, sortable: false },
    {
      field: 'barcode',
      headerName: 'Cód. de Barras',
      width: 160,
      sortable: false,
      renderCell: ({ value }) => value || '—',
    },
    {
      field: 'price',
      headerName: 'Preço',
      width: 130,
      sortable: false,
      renderCell: ({ value }) => formatBRL(value as number),
    },
    {
      field: 'stock',
      headerName: 'Estoque',
      width: 100,
      sortable: false,
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          color={value === 0 ? 'error' : (value as number) <= 5 ? 'warning.main' : 'text.primary'}
        >
          {value as number}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      sortable: false,
      renderCell: ({ value }) => (
        <Chip label={value ? 'Ativo' : 'Inativo'} color={value ? 'success' : 'default'} size="small" />
      ),
    },
    ...actionColumn,
  ];

  const selectedCount = selectionModel.ids.size;
  const hasMultipleSelected = selectedCount > 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" gutterBottom>
        Estoque
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <TextField
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select value={sortValue} label="Ordenar por" onChange={e => handleSortChange(e.target.value)}>
            {SORT_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isAdmin &&
          (hasMultipleSelected ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => openConfirm(Array.from(selectionModel.ids).map(String))}
            >
              Excluir ({selectedCount})
            </Button>
          ) : (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
              Adicionar
            </Button>
          ))}
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={products}
          columns={columns}
          rowCount={totalCount}
          loading={loading === 'fetch'}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={model => {
            setPaginationModel(model);
            setSelectionModel(EMPTY_SELECTION);
          }}
          pageSizeOptions={[10, 20, 50]}
          checkboxSelection
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={setSelectionModel}
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
            noRowsLabel: 'Nenhum produto encontrado.',
            footerRowSelected: count => `${count} selecionado(s)`,
          }}
        />
      </Box>

      <ProductFormModal
        open={modalOpen}
        product={editProduct ?? undefined}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
        onSuccess={() => setRefreshToken(t => t + 1)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={pendingIds.length === 1 ? 'Excluir produto' : `Excluir ${pendingIds.length} produtos`}
        message={
          pendingIds.length === 1
            ? 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.'
            : `Tem certeza que deseja excluir os ${pendingIds.length} produtos selecionados?`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={loading === 'remove'}
      />
    </Box>
  );
};

export default StockPage;
