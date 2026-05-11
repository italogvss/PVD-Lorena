import { FC, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import type { CreateExpenseRequest, Expense, UpdateExpenseRequest } from '../../types';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseRequest | UpdateExpenseRequest) => Promise<void>;
  expense?: Expense | null;
  loading: boolean;
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  isRecurring: false,
  dueDate: '',
  isPaid: false,
};

const ExpenseFormModal: FC<ExpenseFormModalProps> = ({ open, onClose, onSubmit, expense, loading }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (expense) {
      setForm({
        description: expense.description,
        amount: String(expense.amount),
        isRecurring: expense.isRecurring,
        dueDate: expense.dueDate.slice(0, 10),
        isPaid: expense.isPaid,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [expense, open]);

  const handleSubmit = async () => {
    await onSubmit({
      description: form.description,
      amount: parseFloat(form.amount),
      isRecurring: form.isRecurring,
      dueDate: new Date(form.dueDate).toISOString(),
      isPaid: form.isPaid,
    });
  };

  const isEditing = Boolean(expense);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Descrição"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Valor (R$)"
            type="number"
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Data de Vencimento"
            type="date"
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isRecurring}
                onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
              />
            }
            label="Renova mensalmente"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isPaid}
                onChange={e => setForm(f => ({ ...f, isPaid: e.target.checked }))}
              />
            }
            label="Já foi paga"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !form.description || !form.amount || !form.dueDate}
        >
          {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseFormModal;
