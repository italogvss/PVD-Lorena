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
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MuiTooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useExpense } from '../../hooks/useExpense';
import { useReport } from '../../hooks/useReport';
import { useToast } from '../../hooks/useToast';
import type { ChartGroupBy } from '../../services/reportService';
import type { ExpenseChartPoint, SalesChartPoint } from '../../types';
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
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  switch (groupBy) {
    case 'day':   return { start: fmt(ago(29)), end: fmt(endOfMonth) };
    case 'week':  return { start: fmt(ago(83)), end: fmt(endOfMonth) };
    case 'month': return { start: fmt(new Date(today.getFullYear() - 1, today.getMonth(), 1)), end: fmt(endOfMonth) };
    case 'year':  return { start: fmt(new Date(today.getFullYear() - 4, 0, 1)), end: fmt(endOfMonth) };
  }
};

interface SeriesVisibility {
  faturamento: boolean;
  expenses: boolean;
  netProfit: boolean;
}

const ReportsPage: FC = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { loading: reportLoading, getSalesChart } = useReport();
  const { loading: expenseLoading, getChart: getExpenseChart } = useExpense();

  const [groupBy, setGroupBy] = useState<ChartGroupBy>('month');
  const [range, setRange] = useState(() => defaultRange('month'));
  const [salesData, setSalesData] = useState<SalesChartPoint[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseChartPoint[]>([]);
  const [series, setSeries] = useState<SeriesVisibility>({
    faturamento: true,
    expenses: true,
    netProfit: true,
  });

  const doFetch = useCallback((gb: ChartGroupBy, start: string, end: string) => {
    if (!start || !end || start > end) return;
    Promise.all([
      getSalesChart({ startDate: start, endDate: end, groupBy: gb }),
      getExpenseChart({ startDate: start, endDate: end, groupBy: gb }),
    ])
      .then(([sales, expenses]) => {
        setSalesData(sales ?? []);
        setExpenseData(expenses ?? []);
      })
      .catch(() => showToast('Erro ao carregar dados do gráfico.', 'error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    doFetch(groupBy, range.start, range.end);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGroupByChange = (_: React.MouseEvent, value: ChartGroupBy | null) => {
    if (!value) return;
    const newRange = defaultRange(value);
    setGroupBy(value);
    setRange(newRange);
    doFetch(value, newRange.start, newRange.end);
  };

  const handleApply = () => doFetch(groupBy, range.start, range.end);

  const expenseByLabel = new Map(expenseData.map(e => [e.label, e.total]));

  const labels        = salesData.map(p => p.label);
  const revenueValues = salesData.map(p => p.total);
  const cogsValues    = salesData.map(p => p.cost);
  const grossValues   = salesData.map(p => Math.max(0, p.total - p.cost));
  const expenseValues = labels.map(l => expenseByLabel.get(l) ?? 0);
  const netProfitValues = labels.map((_, i) => Math.max(0, grossValues[i] - expenseValues[i]));

  const totalRevenue   = revenueValues.reduce((s, v) => s + v, 0);
  const totalCogs      = cogsValues.reduce((s, v) => s + v, 0);
  const totalGross     = Math.max(0, totalRevenue - totalCogs);
  const totalExpenses  = expenseValues.reduce((s, v) => s + v, 0);
  const totalNet       = Math.max(0, totalGross - totalExpenses);
  const totalSales     = salesData.reduce((s, p) => s + p.count, 0);
  const avgTicket      = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Stacked faturamento bar: COGS (bottom, white/dim) + Lucro Bruto (top, primary blue)
  // Separate bars: Despesas (red) and Lucro Líquido (green)
  const datasets = [
    ...(series.faturamento ? [
      {
        label: 'Custo (produtos)',
        data: cogsValues,
        backgroundColor: alpha(theme.palette.info.main, 0.35),
        borderColor: theme.palette.info.main,
        borderWidth: 1,
        borderRadius: 0,
        stack: 'faturamento',
      },
      {
        label: 'Lucro Bruto',
        data: grossValues,
        backgroundColor: theme.palette.primary.main + 'bb',
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
        borderRadius: 4,
        stack: 'faturamento',
      },
    ] : []),
    ...(series.expenses ? [{
      label: 'Despesas',
      data: expenseValues,
      backgroundColor: theme.palette.error.main + '55',
      borderColor: theme.palette.error.main,
      borderWidth: 1,
      borderRadius: 4,
      stack: 'expenses',
    }] : []),
    ...(series.netProfit ? [{
      label: 'Lucro Líquido',
      data: netProfitValues,
      backgroundColor: theme.palette.success.main + '55',
      borderColor: theme.palette.success.main,
      borderWidth: 1,
      borderRadius: 4,
      stack: 'net',
    }] : []),
  ];

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: theme.palette.text.secondary } },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number }; dataset: { label?: string } }) =>
            `${ctx.dataset.label}: ${formatBRL(ctx.parsed.y)}`,
          afterLabel: (ctx: { dataIndex: number; dataset: { label?: string } }) =>
            ctx.dataset.label === 'Lucro Bruto'
              ? `Qtd. vendas: ${salesData[ctx.dataIndex]?.count ?? 0}`
              : '',
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary },
      },
      y: {
        stacked: false,
        grid: { color: theme.palette.divider },
        ticks: {
          color: theme.palette.text.secondary,
          callback: (value: number | string) => formatBRL(Number(value)),
        },
      },
    },
  };

  const isLoading = reportLoading === 'chart' || expenseLoading === 'fetchChart';
  const hasData = salesData.length > 0 || expenseData.length > 0;

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
          <Button variant="contained" onClick={handleApply} disabled={isLoading}>
            Aplicar
          </Button>
        </Stack>
      </Paper>

      {/* Summary cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(5, 1fr)' }, gap: 2 }}>
        <SummaryCard
          label="Faturamento"
          value={formatBRL(totalRevenue)}
          tooltip="Soma de todas as vendas ativas no período."
        />
        <SummaryCard
          label="Lucro Bruto"
          value={formatBRL(totalGross)}
          color="primary.main"
          tooltip={`Faturamento − Custo dos produtos vendidos.\n${formatBRL(totalRevenue)} − ${formatBRL(totalCogs)} = ${formatBRL(totalGross)}`}
        />
        <SummaryCard
          label="Despesas"
          value={formatBRL(totalExpenses)}
          color="error.main"
          tooltip="Soma das despesas com vencimento no período selecionado."
        />
        <SummaryCard
          label="Lucro Líquido"
          value={formatBRL(totalNet)}
          color="success.main"
          tooltip={`Lucro Bruto − Despesas.\n${formatBRL(totalGross)} − ${formatBRL(totalExpenses)} = ${formatBRL(totalNet)}`}
        />
        <SummaryCard
          label="Ticket médio"
          value={formatBRL(avgTicket)}
          tooltip={`Faturamento ÷ Número de vendas.\n${formatBRL(totalRevenue)} ÷ ${totalSales} venda(s)`}
        />
      </Box>

      {/* Chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, minHeight: 420 }}>
        {/* Series toggles */}
        <Stack direction="row" spacing={0} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={series.faturamento}
                onChange={e => setSeries(s => ({ ...s, faturamento: e.target.checked }))}
                sx={{ '&.Mui-checked': { color: 'primary.main' } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Faturamento
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={series.expenses}
                onChange={e => setSeries(s => ({ ...s, expenses: e.target.checked }))}
                sx={{ '&.Mui-checked': { color: 'error.main' } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                Despesas
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={series.netProfit}
                onChange={e => setSeries(s => ({ ...s, netProfit: e.target.checked }))}
                sx={{ '&.Mui-checked': { color: 'success.main' } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                Lucro Líquido
              </Typography>
            }
          />
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
            <CircularProgress />
          </Box>
        ) : !hasData || datasets.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
            <Typography color="text.secondary">
              {datasets.length === 0
                ? 'Selecione pelo menos uma série para exibir.'
                : 'Nenhum dado encontrado no período.'}
            </Typography>
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

const SummaryCard: FC<{ label: string; value: string; color?: string; tooltip: string }> = ({ label, value, color, tooltip }) => (
  <MuiTooltip title={<Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{tooltip}</Typography>} arrow placement="top">
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, cursor: 'help' }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: color ?? 'text.primary' }}>
        {value}
      </Typography>
    </Paper>
  </MuiTooltip>
);

export default ReportsPage;
