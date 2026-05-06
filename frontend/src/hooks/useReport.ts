import { useState } from 'react';
import reportService, { SalesChartParams, SalesReportParams } from '../services/reportService';

type LoadingState = 'metrics' | 'byOperator' | 'stock' | 'exportSales' | 'exportStock' | 'chart' | null;

export function useReport() {
  const [loading, setLoading] = useState<LoadingState>(null);

  const getSalesMetrics = async (params: SalesReportParams) => {
    setLoading('metrics');
    try {
      return await reportService.getSalesMetrics(params);
    } finally {
      setLoading(null);
    }
  };

  const getSalesByOperator = async (params: SalesReportParams) => {
    setLoading('byOperator');
    try {
      return await reportService.getSalesByOperator(params);
    } finally {
      setLoading(null);
    }
  };

  const getStock = async () => {
    setLoading('stock');
    try {
      return await reportService.getStock();
    } finally {
      setLoading(null);
    }
  };

  const exportSalesCSV = async (params: SalesReportParams) => {
    setLoading('exportSales');
    try {
      return await reportService.exportSalesCSV(params);
    } finally {
      setLoading(null);
    }
  };

  const exportStockCSV = async () => {
    setLoading('exportStock');
    try {
      return await reportService.exportStockCSV();
    } finally {
      setLoading(null);
    }
  };

  const getSalesChart = async (params: SalesChartParams) => {
    setLoading('chart');
    try {
      return await reportService.getSalesChart(params);
    } finally {
      setLoading(null);
    }
  };

  return { loading, getSalesMetrics, getSalesByOperator, getStock, exportSalesCSV, exportStockCSV, getSalesChart };
}
