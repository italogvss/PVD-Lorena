import { FC, forwardRef, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import { IMaskInput } from 'react-imask';
import { useProduct } from '../../hooks/useProduct';
import { useToast } from '../../hooks/useToast';
import type { CreateProductRequest, Product } from '../../types';

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
  product?: Product;
}

const EMPTY_FORM = {
  name: '',
  barcode: '',
  ncm: '',
  price: '',
  purchasePrice: '',
  stock: '',
};

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
  ncm?: string;
}

const parseCurrency = (value: string): number =>
  parseFloat(value.replace(/\./g, '').replace(',', '.'));

const formatCurrencyValue = (value: number): string =>
  value.toFixed(2).replace('.', ',');

const ProductFormModal: FC<ProductFormModalProps> = ({ open, onClose, onSuccess, product }) => {
  const { showToast } = useToast();
  const { loading, create, update, adjustStock } = useProduct();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [prevOpen, setPrevOpen] = useState(false);

  const isEditMode = !!product;

  // React-recommended pattern: adjust state when a prop changes during render.
  // Calling setState here causes React to discard the output and re-render immediately,
  // but the condition won't be true on the next render, so no infinite loop occurs.
  if (open !== prevOpen) {
    setPrevOpen(open);
    setErrors({});
    if (open && product) {
      setForm({
        name: product.name,
        barcode: product.barcode ?? '',
        ncm: product.ncm ?? '',
        price: formatCurrencyValue(product.price),
        purchasePrice: product.purchasePrice != null ? formatCurrencyValue(product.purchasePrice) : '',
        stock: String(product.stock),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }

  const handleChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const profitPercent = useMemo(() => {
    const sale = parseCurrency(form.price);
    const purchase = parseCurrency(form.purchasePrice);
    if (!form.purchasePrice || isNaN(purchase) || purchase <= 0) return null;
    if (!form.price || isNaN(sale) || sale <= 0) return null;
    return ((sale - purchase) / purchase) * 100;
  }, [form.price, form.purchasePrice]);

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

  const buildCreatePayload = (): CreateProductRequest => {
    const purchasePrice = parseCurrency(form.purchasePrice);
    return {
      name: form.name.trim(),
      barcode: form.barcode.trim() || undefined,
      ncm: form.ncm.trim() || undefined,
      price: parseCurrency(form.price),
      purchasePrice: form.purchasePrice && !isNaN(purchasePrice) ? purchasePrice : undefined,
      stock: parseInt(form.stock, 10),
    };
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (andNew: boolean) => {
    if (!validate()) return;
    try {
      if (isEditMode) {
        const newStock = parseInt(form.stock, 10);
        const delta = newStock - product.stock;
        const purchasePrice = parseCurrency(form.purchasePrice);

        await update(product.id, {
          name: form.name.trim(),
          barcode: form.barcode.trim() || undefined,
          ncm: form.ncm.trim() || undefined,
          price: parseCurrency(form.price),
          purchasePrice: form.purchasePrice && !isNaN(purchasePrice) ? purchasePrice : undefined,
        });

        if (delta !== 0) {
          await adjustStock(product.id, delta);
        }

        showToast('Produto atualizado com sucesso.', 'success');
        onSuccess();
        handleClose();
      } else {
        await create(buildCreatePayload());
        showToast('Produto criado com sucesso.', 'success');
        onSuccess();
        if (andNew) {
          setForm(EMPTY_FORM);
          setErrors({});
        } else {
          handleClose();
        }
      }
    } catch {
      showToast(isEditMode ? 'Erro ao atualizar produto.' : 'Erro ao criar produto.', 'error');
    }
  };

  const isSubmitting = loading === 'create' || loading === 'update' || loading === 'adjustStock';

  const profitChipColor =
    profitPercent === null ? undefined :
    profitPercent >= 0 ? 'success' : 'error';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {/* Profit indicator */}
          <Box sx={{ mb: 2, minHeight: 28 }}>
            {profitPercent !== null ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Margem de lucro:
                </Typography>
                <Chip
                  label={`${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(1)}%`}
                  color={profitChipColor}
                  size="small"
                  variant="outlined"
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled">
                Preencha o custo e o preço de venda para calcular a margem de lucro.
              </Typography>
            )}
          </Box>

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
                label="Custo (R$)"
                fullWidth
                value={form.purchasePrice}
                onChange={e => handleChange('purchasePrice', e.target.value)}
                disabled={isSubmitting}
                helperText="Valor de compra (opcional)"
                slotProps={{
                  input: {
                    inputComponent: CurrencyInput as React.ElementType<InputBaseComponentProps>,
                    inputProps: { name: 'purchasePrice' },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Preço de venda (R$)"
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
                label={isEditMode ? 'Estoque' : 'Estoque inicial'}
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

            <Grid size={12}>
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
        <Button
          variant="outlined"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting || isEditMode}
        >
          {isSubmitting ? 'Salvando...' : 'Adicionar e Novo'}
        </Button>
        <Button variant="contained" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditMode ? 'Alterar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModal;
