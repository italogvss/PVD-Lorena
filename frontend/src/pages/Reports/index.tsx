import { FC, useCallback, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useReport } from '../../hooks/useReport';
import { useToast } from '../../hooks/useToast';
import type { SalesChartPoint } from '../../types';
import type { ChartGroupBy } from '../../services/reportService';
import { formatBRL } from '../../utils/currency';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GROUP_LABELS: Record<ChartGroupBy, string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
};

const defaultRange = (groupBy: ChartGroupBy): { start: string; end: string } => {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const ago = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);

  switch (groupBy) {
    case 'day':   return { start: fmt(ago(29)), end: fmt(today) };
    case 'week':  return { start: fmt(ago(83)), end: fmt(today) };
    case 'month': return { start: fmt(new Date(today.getFullYear() - 1, today.getMonth(), 1)), end: fmt(today) };
    case 'year':  return { start: fmt(new Date(today.getFullYear() - 4, 0, 1)), end: fmt(today) };
  }
};

const ReportsPage: FC = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { loading, getSalesChart } = useReport();

  const [groupBy, setGroupBy] = useState<ChartGroupBy>('month');
  const [range, setRange] = useState(() => defaultRange('month'));
  const [data, setData] = useState<SalesChartPoint[]>([]);

  const fetchChart = useCallback(async (gb: ChartGroupBy, start: string, end: string) => {
    if (!start || !end || start > end) return;
    try {
      const result = await getSalesChart({ startDate: start, endDate: end, groupBy: gb });
      setData(result ?? []);
    } catch {
      showToast('Erro ao carregar dados do gráfico.', 'error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchChart(groupBy, range.start, range.end);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGroupByChange = (_: React.MouseEvent, value: ChartGroupBy | null) => {
    if (!value) return;
    const newRange = defaultRange(value);
    setGroupBy(value);
    setRange(newRange);
    fetchChart(value, newRange.start, newRange.end);
  };

  const handleApply = () => fetchChart(groupBy, range.start, range.end);

  const totalRevenue = data.reduce((s, p) => s + p.total, 0);
  const totalSales   = data.reduce((s, p) => s + p.count, 0);
  const avgTicket    = totalSales > 0 ? totalRevenue / totalSales : 0;

  const chartData = {
    labels: data.map(p => p.label),
    datasets: [
      {
        label: 'Faturamento',
        data: data.map(p => p.total),
        backgroundColor: theme.palette.primary.main + 'bb',
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number }; dataset: { label?: string } }) =>
            `${ctx.dataset.label}: ${formatBRL(ctx.parsed.y)}`,
          afterLabel: (ctx: { dataIndex: number }) =>
            `Qtd. vendas: ${data[ctx.dataIndex]?.count ?? 0}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary },
      },
      y: {
        grid: { color: theme.palette.divider },
        ticks: {
          color: theme.palette.text.secondary,
          callback: (value: number | string) => formatBRL(Number(value)),
        },
      },
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5">Relatório de Vendas</Typography>

      {/* Controls */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, flexWrap: 'wrap' }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={groupBy}
            onChange={handleGroupByChange}
          >
            {(Object.keys(GROUP_LABELS) as ChartGroupBy[]).map(g => (
              <ToggleButton key={g} value={g} sx={{ px: 2, fontWeight: 600 }}>
                {GROUP_LABELS[g]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            label="Data início"
            type="date"
            size="small"
            value={range.start}
            onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 170 }}
          />
          <TextField
            label="Data fim"
            type="date"
            size="small"
            value={range.end}
            onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 170 }}
          />
          <Button variant="contained" onClick={handleApply} disabled={loading === 'chart'}>
            Aplicar
          </Button>
        </Stack>
      </Paper>

      {/* Summary cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
        <SummaryCard label="Faturamento total" value={formatBRL(totalRevenue)} />
        <SummaryCard label="Total de vendas" value={String(totalSales)} />
        <SummaryCard label="Ticket médio" value={formatBRL(avgTicket)} />
      </Box>

      {/* Chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, position: 'relative', minHeight: 360 }}>
        {loading === 'chart' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
            <Typography color="text.secondary">Nenhuma venda encontrada no período.</Typography>
          </Box>
        ) : (
          <Box sx={{ height: 320 }}>
            <Bar data={chartData} options={chartOptions as Parameters<typeof Bar>[0]['options']} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const SummaryCard: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
      {value}
    </Typography>
  </Paper>
);

export default ReportsPage;
