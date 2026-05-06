import { FC, useCallback, useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../hooks/useAuth';
import { useProduct } from '../../hooks/useProduct';
import { useSale } from '../../hooks/useSale';
import { useToast } from '../../hooks/useToast';
import type { PaymentMethod, Product } from '../../types';
import { formatBRL } from '../../utils/currency';
import { generateReceiptPDF } from '../../utils/pdf';

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  Cash: 'Dinheiro',
  PIX: 'PIX',
  'Credit Card': 'Crédito',
  'Debit Card': 'Débito',
};

const INSTALLMENT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const POSPage: FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { getAll: getProducts, loading: productLoading } = useProduct();
  const { create: createSale, loading: saleLoading } = useSale();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [installmentCount, setInstallmentCount] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchOptions, setSearchOptions] = useState<Product[]>([]);

  const isInstallment = paymentMethod === 'Credit Card';
  const isCash = paymentMethod === 'Cash';

  const total = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const installmentValue = isInstallment && installmentCount > 0 ? total / installmentCount : 0;
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = isCash && amountPaidNum > total ? amountPaidNum - total : 0;

  const fetchProducts = useCallback(async (name: string) => {
    if (!name.trim()) {
      setSearchOptions([]);
      return;
    }
    try {
      const result = await getProducts({ page: 1, pageSize: 20, name });
      setSearchOptions(result?.data ?? []);
    } catch {
      setSearchOptions([]);
    }
  }, [getProducts]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput, fetchProducts]);

  const addToCart = (product: Product | null) => {
    if (!product) return;
    setSearchInput('');
    setSearchOptions([]);

    const existing = cart.find((i) => i.productId === product.id);
    if (existing && existing.quantity >= product.stock) {
      showToast(`Estoque insuficiente para "${product.name}". Disponível: ${product.stock} unid.`, 'error');
      return;
    }
    if (!existing && product.stock < 1) {
      showToast(`"${product.name}" está sem estoque.`, 'error');
      return;
    }

    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id);
      if (found) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, value: number) => {
    if (value < 1) return;
    setCart((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        if (value > i.stock) {
          showToast(`Estoque máximo para este produto: ${i.stock} unid.`, 'error');
          return i;
        }
        return { ...i, quantity: value };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setPaymentMethod('Cash');
    setInstallmentCount(2);
    setCustomerName('');
    setAmountPaid('');
  };

  const handleFinalizarVenda = async () => {
    if (cart.length === 0) return;

    if (isCash && amountPaidNum < total) {
      showToast('Valor pago insuficiente para cobrir o total.', 'error');
      return;
    }

    try {
      const result = await createSale({
        customerName: customerName.trim() || undefined,
        paymentMethod,
        isInstallment,
        installmentCount: isInstallment ? installmentCount : undefined,
        amountPaid: isCash ? amountPaidNum : total,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });

      if (result) {
        generateReceiptPDF(result);
        showToast('Venda finalizada com sucesso!', 'success');
        handleClearCart();
      }
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast(detail ?? 'Erro ao finalizar venda.', 'error');
    }
  };

  const isSubmitting = saleLoading === 'create';

  return (
    <Box
      sx={{
        height: { xs: 'auto', md: 'calc(100vh - 48px)' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      {/* ── Left panel: search + cart ─────────────────────────────── */}
      <Box
        sx={{
          flex: { xs: 'none', md: 1.4 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: 3,
          overflow: { xs: 'visible', md: 'hidden' },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Search */}
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '0.02em' }}>
            Buscar Produto
          </Typography>
          <Autocomplete
            options={searchOptions}
            getOptionLabel={(option) => option.name}
            inputValue={searchInput}
            onInputChange={(_, value) => setSearchInput(value)}
            onChange={(_, value) => addToCart(value)}
            value={null}
            clearOnEscape
            blurOnSelect
            filterOptions={(x) => x}
            noOptionsText={
              searchInput.trim().length === 0
                ? 'Digite para buscar...'
                : 'Nenhum produto encontrado'
            }
            loading={productLoading === 'fetch'}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Digite o nome ou código do produto..."
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...(params.slotProps?.input as object),
                    startAdornment: (
                      <SearchIcon sx={{ color: 'text.secondary', ml: 1, mr: 0.5, fontSize: 22 }} />
                    ),
                    endAdornment: productLoading === 'fetch'
                      ? <CircularProgress size={18} />
                      : (params.slotProps?.input as { endAdornment?: React.ReactNode })?.endAdornment,
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {option.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estoque: {option.stock} unid.
                  </Typography>
                </Box>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 700, ml: 2 }}>
                  {formatBRL(option.price)}
                </Typography>
              </Box>
            )}
          />
        </Box>

        <Divider />

        {/* Cart header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ShoppingCartIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Itens no carrinho
          </Typography>
          {totalItems > 0 && (
            <Chip
              label={totalItems}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.85rem' }}
            />
          )}
        </Box>

        <Divider />

        {/* Cart items list */}
        <Box sx={{ flexGrow: 1, overflowY: { xs: 'visible', md: 'auto' }, px: 1.5, py: 1 }}>
          {cart.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                opacity: 0.4,
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 64 }} />
              <Typography variant="h6" color="text.secondary">
                Carrinho vazio
              </Typography>
            </Box>
          ) : (
            cart.map((item) => (
              <Box
                key={item.productId}
                onMouseEnter={() => setHoveredItem(item.productId)}
                onMouseLeave={() => setHoveredItem(null)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 0.5,
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {formatBRL(item.unitPrice)} / unid.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    size="small"
                    color="primary"
                    disabled={item.quantity <= 1}
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'primary.main', color: 'background.default' },
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        max: item.stock,
                        style: { textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, width: 40, padding: '8px 4px' },
                      },
                      input: { disableUnderline: true, sx: { '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { display: 'none' }, 'input[type=number]': { MozAppearance: 'textfield' } } },
                    }}
                    sx={{ width: 60 }}
                  />
                  <IconButton
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    size="small"
                    color="primary"
                    disabled={item.quantity >= item.stock}
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'primary.main', color: 'background.default' },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, fontSize: '1.05rem', minWidth: 90, textAlign: 'right' }}
                >
                  {formatBRL(item.unitPrice * item.quantity)}
                </Typography>

                <IconButton
                  onClick={() => removeFromCart(item.productId)}
                  size="small"
                  color="error"
                  sx={{
                    opacity: hoveredItem === item.productId ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    borderRadius: 1.5,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* ── Right panel: summary + actions ───────────────────────── */}
      <Box
        sx={{
          width: { xs: '100%', md: 380, lg: 440 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: { xs: 'visible', md: 'hidden' },
        }}
      >
        {/* Summary header */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
            Resumo da Venda
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ flexGrow: 1, overflowY: { xs: 'visible', md: 'auto' }, px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Operator */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 600 }}>
              Operador
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
              {user?.name ?? '—'}
            </Typography>
          </Box>

          <Divider />

          {/* Customer name */}
          <TextField
            label="Cliente (opcional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nome do cliente..."
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Divider />

          {/* Items count */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Quantidade de itens
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {totalItems}
            </Typography>
          </Box>

          <Divider />

          {/* Payment method */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 600, mb: 1.5 }}>
              Forma de Pagamento
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={paymentMethod}
              onChange={(_, val) => val && setPaymentMethod(val as PaymentMethod)}
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}
            >
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                <ToggleButton
                  key={method}
                  value={method}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: '8px !important',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {PAYMENT_LABELS[method]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Installments — only for Credit Card */}
          {isInstallment && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 600, mb: 1.5 }}>
                Número de Parcelas
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={installmentCount}
                  onChange={(e) => setInstallmentCount(Number(e.target.value))}
                >
                  {INSTALLMENT_OPTIONS.map((n) => (
                    <MenuItem key={n} value={n}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {n}× de {formatBRL(total / n)}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {total > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Valor por parcela: <strong>{formatBRL(installmentValue)}</strong>
                </Typography>
              )}
            </Box>
          )}

          {/* Amount paid — only for Cash */}
          {isCash && (
            <Box>
              <TextField
                label="Valor recebido"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                type="number"
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  },
                  htmlInput: { min: 0, step: '0.01' },
                }}
              />
              {amountPaidNum >= total && total > 0 && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 600 }}>
                  Troco: {formatBRL(change)}
                </Typography>
              )}
            </Box>
          )}

          <Divider />

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Total
            </Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>
              {formatBRL(total)}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Action buttons */}
        <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleFinalizarVenda}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
            sx={{
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              borderRadius: 2,
            }}
          >
            {isSubmitting ? 'Finalizando...' : 'Finalizar Venda'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="large"
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleClearCart}
            sx={{
              py: 1.75,
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              borderRadius: 2,
            }}
          >
            Cancelar Venda
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default POSPage;
