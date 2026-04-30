import { FC } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel, loading = false }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
        {loading ? 'Excluindo...' : 'Excluir'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
