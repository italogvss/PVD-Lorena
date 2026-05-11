import { FC, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useUser } from '../../hooks/useUser';
import { useToast } from '../../hooks/useToast';
import type { CreateUserRequest, UpdateUserRequest, User, UserRole } from '../../types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User;
}

const EMPTY_FORM = { name: '', username: '', password: '', role: 'Employee' as UserRole };

interface FormErrors {
  name?: string;
  username?: string;
  password?: string;
  role?: string;
}

const UserFormModal: FC<UserFormModalProps> = ({ open, onClose, onSuccess, user }) => {
  const { showToast } = useToast();
  const { loading, create, update } = useUser();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = !!user;

  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name, username: user.username, password: '', role: user.role });
      setErrors({});
    } else if (!open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open, user]);

  const handleChange = <K extends keyof typeof EMPTY_FORM>(field: K, value: (typeof EMPTY_FORM)[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!form.name.trim()) next.name = 'Nome é obrigatório.';
    if (!form.username.trim()) next.username = 'Nome de usuário é obrigatório.';
    if (!isEditMode && !form.password) next.password = 'Senha é obrigatória.';
    if (!isEditMode && form.password && form.password.length < 4)
      next.password = 'Senha deve ter no mínimo 4 caracteres.';
    if (!form.role) next.role = 'Perfil é obrigatório.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEditMode) {
        const payload: UpdateUserRequest = {
          name: form.name.trim(),
          username: form.username.trim(),
          role: form.role,
        };
        await update(user.id, payload);
        showToast('Usuário atualizado com sucesso.', 'success');
      } else {
        const payload: CreateUserRequest = {
          name: form.name.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
        };
        await create(payload);
        showToast('Usuário criado com sucesso.', 'success');
      }
      onSuccess();
      onClose();
    } catch {
      showToast(isEditMode ? 'Erro ao atualizar usuário.' : 'Erro ao criar usuário.', 'error');
    }
  };

  const isSubmitting = loading === 'create' || loading === 'update';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label="Nome completo"
                fullWidth
                required
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nome de usuário"
                fullWidth
                required
                value={form.username}
                onChange={e => handleChange('username', e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required error={!!errors.role}>
                <InputLabel>Perfil</InputLabel>
                <Select
                  value={form.role}
                  label="Perfil"
                  onChange={e => handleChange('role', e.target.value as UserRole)}
                  disabled={isSubmitting}
                >
                  <MenuItem value="Employee">Funcionário</MenuItem>
                  <MenuItem value="Admin">Administrador</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>

            {!isEditMode && (
              <Grid size={12}>
                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  required
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password ?? 'Mínimo de 4 caracteres.'}
                  disabled={isSubmitting}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="text" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditMode ? 'Alterar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
