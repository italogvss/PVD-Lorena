import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/date';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const MetricCard: FC<MetricCardProps> = ({ label, value, icon }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}
          >
            {label}
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
            {value}
          </Typography>
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

const METRICS: MetricCardProps[] = [
  { label: 'Vendas Hoje',      value: '—',       icon: <PointOfSaleIcon fontSize="small" /> },
  { label: 'Receita do Dia',   value: '—',       icon: <TrendingUpIcon  fontSize="small" /> },
  { label: 'Produtos Ativos',  value: '—',       icon: <InventoryIcon   fontSize="small" /> },
  { label: 'Vendas do Mês',    value: '—',       icon: <ReceiptLongIcon fontSize="small" /> },
];

const DashboardPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = formatDate(new Date().toISOString());

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Bem-vindo, {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {today}
        </Typography>
      </Box>

      {/* Metric cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {METRICS.map((m) => (
          <Grid key={m.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Quick access */}
      <Typography
        variant="caption"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary' }}
      >
        Acesso Rápido
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<PointOfSaleIcon />}
          onClick={() => navigate('/pos')}
        >
          Realizar Venda
        </Button>

        <Button
          variant="outlined"
          startIcon={<InventoryIcon />}
          onClick={() => navigate('/stock')}
        >
          Ver Estoque
        </Button>

        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => navigate('/sales')}
        >
          Histórico de Vendas
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardPage;
