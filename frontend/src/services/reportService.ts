import api from '../lib/axios';
import type { SalesMetrics, SalesByOperator, StockSnapshot, ReportPeriod } from '../types';

export interface SalesReportParams {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

const reportService = {
  getSalesMetrics: (params: SalesReportParams) =>
    api.get<SalesMetrics>('/api/reports/sales', { params }).then(r => r.data),

  getSalesByOperator: (params: SalesReportParams) =>
    api.get<SalesByOperator[]>('/api/reports/sales/by-operator', { params }).then(r => r.data),

  getStock: () =>
    api.get<StockSnapshot[]>('/api/reports/stock').then(r => r.data),

  exportSalesCSV: (params: SalesReportParams) =>
    api.get<Blob>('/api/reports/sales/export', { params, responseType: 'blob' }).then(r => r.data),

  exportStockCSV: () =>
    api.get<Blob>('/api/reports/stock/export', { responseType: 'blob' }).then(r => r.data),
};

export default reportService;
