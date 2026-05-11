import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { useProduct } from '../../hooks/useProduct';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/date';
import { formatBRL } from '../../utils/currency';
import type { SalesMetrics } from '../../types';

interface MetricCardProps {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  loading: boolean;
}

const MetricCard: FC<MetricCardProps> = ({ label, value, icon, loading }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={100} height={44} sx={{ mt: 0.5 }} />
          ) : (
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
              {value ?? '—'}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: 'secondary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getSalesMetrics } = useReport();
  const { getAll: getProducts } = useProduct();

  const today = formatDate(new Date().toISOString());

  const [dailyMetrics, setDailyMetrics] = useState<SalesMetrics | null>(null);
  const [monthlyMetrics, setMonthlyMetrics] = useState<SalesMetrics | null>(null);
  const [activeProducts, setActiveProducts] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSalesMetrics({ period: 'daily' }),
      getSalesMetrics({ period: 'monthly' }),
      getProducts({ page: 1, pageSize: 1 }),
    ])
      .then(([daily, monthly, products]) => {
        setDailyMetrics(daily ?? null);
        setMonthlyMetrics(monthly ?? null);
        setActiveProducts(products?.totalCount ?? null);
      })
      .catch(() => showToast('Erro ao carregar dados da dashboard.', 'error'))
      .finally(() => setLoading(false));
  // hook functions are not memoized — empty array is intentional (mount only)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = [
    {
      label: 'Vendas Hoje',
      value: dailyMetrics !== null ? String(dailyMetrics.totalSales) : null,
      icon: <PointOfSaleIcon fontSize="small" />,
    },
    {
      label: 'Receita do Dia',
      value: dailyMetrics !== null ? formatBRL(dailyMetrics.totalRevenue) : null,
      icon: <TrendingUpIcon fontSize="small" />,
    },
    {
      label: 'Produtos Ativos',
      value: activeProducts !== null ? String(activeProducts) : null,
      icon: <InventoryIcon fontSize="small" />,
    },
    {
      label: 'Vendas do Mês',
      value: monthlyMetrics !== null ? String(monthlyMetrics.totalSales) : null,
      icon: <ReceiptLongIcon fontSize="small" />,
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Bem-vindo, {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {today}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {metrics.map((m) => (
          <Grid key={m.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard {...m} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      <Typography
        variant="caption"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary' }}
      >
        Acesso Rápido
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PointOfSaleIcon sx={{ fontSize: '1.5rem' }} />}
          onClick={() => navigate('/pos')}
          sx={{ py: 2, px: 3, fontSize: '1.05rem' }}
        >
          Realizar Venda
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<InventoryIcon sx={{ fontSize: '1.5rem' }} />}
          onClick={() => navigate('/stock')}
          sx={{ py: 2, px: 3, fontSize: '1.05rem' }}
        >
          Ver Estoque
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<HistoryIcon sx={{ fontSize: '1.5rem' }} />}
          onClick={() => navigate('/sales')}
          sx={{ py: 2, px: 3, fontSize: '1.05rem' }}
        >
          Histórico de Vendas
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardPage;
