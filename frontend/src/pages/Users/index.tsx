import { FC, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
} from '@mui/x-data-grid';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import UserFormModal from '../../components/ui/UserFormModal';
import { useToast } from '../../hooks/useToast';
import { useUser } from '../../hooks/useUser';
import type { User } from '../../types';
import { formatDateTime } from '../../utils/date';

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Administrador',
  Employee: 'Funcionário',
};

const UsersPage: FC = () => {
  const { showToast } = useToast();
  const { loading, getAll, remove } = useUser();

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPaginationModel(prev => ({ ...prev, page: 0 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    getAll({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: debouncedSearch || undefined,
    })
      .then(result => {
        if (!cancelled && result) {
          setUsers(result.data);
          setTotalCount(result.totalCount);
        }
      })
      .catch(() => {
        if (!cancelled) showToast('Erro ao carregar usuários.', 'error');
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch, refreshToken]);

  const openConfirm = (id: string) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingId) return;
    try {
      await remove(pendingId);
      showToast('Usuário excluído com sucesso.', 'success');
      setConfirmOpen(false);
      setPendingId(null);
      setRefreshToken(t => t + 1);
    } catch {
      showToast('Erro ao excluir usuário.', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180, sortable: false },
    { field: 'username', headerName: 'Usuário', width: 160, sortable: false },
    {
      field: 'role',
      headerName: 'Perfil',
      width: 150,
      sortable: false,
      renderCell: ({ value }) => (
        <Chip
          label={ROLE_LABELS[value as string] ?? value}
          color={value === 'Admin' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      width: 160,
      sortable: false,
      renderCell: ({ value }) => formatDateTime(value as string),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 80,
      getActions: (params: GridRowParams<User>) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => { setEditUser(params.row); setModalOpen(true); }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Excluir"
          onClick={() => openConfirm(params.row.id)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Usuários</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <TextField
          placeholder="Buscar por nome ou usuário..."
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

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditUser(null); setModalOpen(true); }}
        >
          Adicionar
        </Button>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={users}
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
            noRowsLabel: 'Nenhum usuário encontrado.',
            footerRowSelected: count => `${count} selecionado(s)`,
          }}
        />
      </Box>

      <UserFormModal
        open={modalOpen}
        user={editUser ?? undefined}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        onSuccess={() => setRefreshToken(t => t + 1)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingId(null); }}
        loading={loading === 'remove'}
      />
    </Box>
  );
};

export default UsersPage;
