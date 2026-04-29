import { FC, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../hooks/useAuth';
import type { PaymentMethod, Product } from '../../types';
import { formatBRL } from '../../utils/currency';

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

type MockProduct = Pick<Product, 'id' | 'name' | 'price' | 'stock'>;

const MOCK_PRODUCTS: MockProduct[] = [
  { id: '1', name: 'Notebook Dell Inspiron 15', price: 3299.9, stock: 5 },
  { id: '2', name: 'Mouse Logitech MX Master 3', price: 599.9, stock: 12 },
  { id: '3', name: 'Teclado Mecânico Redragon', price: 279.9, stock: 8 },
  { id: '4', name: 'Monitor LG 24" IPS', price: 1149.9, stock: 3 },
  { id: '5', name: 'Headset HyperX Cloud II', price: 449.9, stock: 7 },
  { id: '6', name: 'Webcam Logitech C920', price: 389.9, stock: 10 },
  { id: '7', name: 'SSD Kingston 480GB', price: 219.9, stock: 15 },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  Cash: 'Dinheiro',
  PIX: 'PIX',
  'Credit Card': 'Crédito',
  'Debit Card': 'Débito',
};

const INSTALLMENT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const POSPage: FC = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [installmentCount, setInstallmentCount] = useState(2);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isInstallment = paymentMethod === 'Credit Card';

  const total = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const installmentValue = isInstallment && installmentCount > 0 ? total / installmentCount : 0;

  const addToCart = (product: MockProduct | null) => {
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
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
        },
      ];
    });
  };

  const updateQuantity = (productId: string, value: number) => {
    if (value < 1) return;
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: value } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setPaymentMethod('Cash');
    setInstallmentCount(2);
  };

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
            options={MOCK_PRODUCTS}
            getOptionLabel={(option) => option.name}
            onChange={(_, value) => addToCart(value)}
            value={null}
            clearOnEscape
            blurOnSelect
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
            noOptionsText="Nenhum produto encontrado"
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
                {/* Product info */}
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

                {/* Quantity controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, width: 52, padding: '8px 4px' } } }}
                    sx={{ width: 72 }}
                  />
                  <IconButton
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    size="small"
                    color="primary"
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

                {/* Subtotal */}
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, fontSize: '1.05rem', minWidth: 90, textAlign: 'right' }}
                >
                  {formatBRL(item.unitPrice * item.quantity)}
                </Typography>

                {/* Delete button — visible on hover */}
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
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                <ToggleButton
                  key={method}
                  value={method}
                  sx={{ flex: '1 1 calc(50% - 8px)', py: 1.5, fontSize: '1rem', fontWeight: 600 }}
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
                  displayEmpty
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

          <Divider />

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Total
            </Typography>
            <Typography
              variant="h4"
              color="primary"
              sx={{ fontWeight: 800 }}
            >
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
            disabled={cart.length === 0}
            sx={{
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              borderRadius: 2,
            }}
          >
            Finalizar Venda
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="large"
            disabled={cart.length === 0}
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
