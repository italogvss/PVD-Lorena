import { FC } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open, title, message, onConfirm, onCancel,
  loading = false, confirmLabel = 'Excluir', loadingLabel = 'Aguarde...',
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent sx={{ pt: 2, pb: 1 }}>
      <Typography variant="body1" sx={{ lineHeight: 1.65 }}>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={loading}>
        Voltar
      </Button>
      <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
        {loading ? loadingLabel : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
