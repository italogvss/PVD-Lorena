import { FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
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
  <Dialog
    open={open}
    onClose={onCancel}
    maxWidth="xs"
    fullWidth
    slotProps={{
      paper: {
        sx: {
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: 'none',
        },
      },
    }}
  >
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Box>

    <Divider />

    <Box sx={{ px: 3, py: 2.5 }}>
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
        {message}
      </Typography>
    </Box>

    <Divider />

    <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
      <Button variant="outlined" onClick={onCancel} disabled={loading}>
        Voltar
      </Button>
      <Button variant="contained" onClick={onConfirm} disabled={loading}>
        {loading ? loadingLabel : confirmLabel}
      </Button>
    </Box>
  </Dialog>
);

export default ConfirmDialog;
