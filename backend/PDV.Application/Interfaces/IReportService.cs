using PDV.Application.DTOs.Reports;

namespace PDV.Application.Interfaces;

public interface IReportService
{
    Task<List<SalesChartPoint>> GetSalesChartAsync(
        DateTime startDate, DateTime endDate, string groupBy);
}
