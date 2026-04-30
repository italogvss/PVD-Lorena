import { FC, forwardRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import { IMaskInput } from 'react-imask';
import { useProduct } from '../../hooks/useProduct';
import { useToast } from '../../hooks/useToast';
import type { CreateProductRequest } from '../../types';

interface CurrencyInputProps extends InputBaseComponentProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ onChange, name, value, ...other }, ref) {
    return (
      <IMaskInput
        {...other}
        mask={Number}
        scale={2}
        thousandsSeparator="."
        padFractionalZeros
        normalizeZeros
        radix=","
        mapToRadix={['.']}
        min={0}
        value={value}
        inputRef={ref as (el: HTMLInputElement) => void}
        onAccept={val => onChange({ target: { name, value: val as string } })}
        overwrite
      />
    );
  },
);

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = { name: '', barcode: '', ncm: '', price: '', stock: '' };

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
}

const parseCurrency = (value: string): number =>
  parseFloat(value.replace(/\./g, '').replace(',', '.'));

const ProductFormModal: FC<ProductFormModalProps> = ({ open, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const { loading, create } = useProduct();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!form.name.trim()) {
      next.name = 'Nome é obrigatório.';
    }

    const price = parseCurrency(form.price);
    if (!form.price || isNaN(price) || price < 0) {
      next.price = 'Informe um preço válido.';
    }

    const stock = parseInt(form.stock, 10);
    if (form.stock === '' || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      next.stock = 'Informe uma quantidade válida (número inteiro ≥ 0).';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (): CreateProductRequest => ({
    name: form.name.trim(),
    barcode: form.barcode.trim() || undefined,
    ncm: form.ncm.trim() || undefined,
    price: parseCurrency(form.price),
    stock: parseInt(form.stock, 10),
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (andNew: boolean) => {
    if (!validate()) return;
    try {
      await create(buildPayload());
      showToast('Produto criado com sucesso.', 'success');
      onSuccess();
      if (andNew) {
        resetForm();
      } else {
        handleClose();
      }
    } catch {
      showToast('Erro ao criar produto.', 'error');
    }
  };

  const isSubmitting = loading === 'create';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo Produto</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label="Nome"
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
                label="Preço (R$)"
                fullWidth
                required
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    inputComponent: CurrencyInput as React.ElementType<InputBaseComponentProps>,
                    inputProps: { name: 'price' },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Estoque inicial"
                fullWidth
                required
                type="number"
                value={form.stock}
                onChange={e => handleChange('stock', e.target.value)}
                error={!!errors.stock}
                helperText={errors.stock}
                disabled={isSubmitting}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Código de barras (EAN)"
                fullWidth
                value={form.barcode}
                onChange={e => handleChange('barcode', e.target.value)}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="NCM"
                fullWidth
                value={form.ncm}
                onChange={e => handleChange('ncm', e.target.value)}
                disabled={isSubmitting}
                helperText="Reservado para emissão de NF-e"
                slotProps={{ htmlInput: { maxLength: 8 } }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="text" onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="outlined" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Adicionar e Novo'}
        </Button>
        <Button variant="contained" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModal;
