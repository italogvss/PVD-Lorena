using Microsoft.EntityFrameworkCore;
using PDV.Application.DTOs.Reports;
using PDV.Application.Interfaces;
using PDV.Domain.Enums;
using PDV.Domain.Exceptions;
using PDV.Infrastructure.Persistence;

namespace PDV.Infrastructure.Services;

public class ReportService(AppDbContext context) : IReportService
{
    public async Task<List<SalesChartPoint>> GetSalesChartAsync(
        DateTime startDate, DateTime endDate, string groupBy)
    {
        var start = startDate.Date;
        var end = endDate.Date.AddDays(1).AddTicks(-1); // end of last day

        var sales = await context.Sales
            .Where(s => s.Status == SaleStatus.Active
                     && s.CreatedAt >= start
                     && s.CreatedAt <= end)
            .Select(s => new { s.CreatedAt, s.Total })
            .ToListAsync();

        return groupBy.ToLower() switch
        {
            "day" => FillDays(
                sales.GroupBy(s => s.CreatedAt.Date)
                     .ToDictionary(g => g.Key, g => (g.Sum(s => s.Total), g.Count())),
                startDate.Date, endDate.Date),

            "week" => FillWeeks(
                sales.GroupBy(s => GetMonday(s.CreatedAt))
                     .ToDictionary(g => g.Key, g => (g.Sum(s => s.Total), g.Count())),
                GetMonday(startDate), GetMonday(endDate)),

            "month" => FillMonths(
                sales.GroupBy(s => new DateTime(s.CreatedAt.Year, s.CreatedAt.Month, 1))
                     .ToDictionary(g => g.Key, g => (g.Sum(s => s.Total), g.Count())),
                new DateTime(startDate.Year, startDate.Month, 1),
                new DateTime(endDate.Year, endDate.Month, 1)),

            "year" => FillYears(
                sales.GroupBy(s => s.CreatedAt.Year)
                     .ToDictionary(g => g.Key, g => (g.Sum(s => s.Total), g.Count())),
                startDate.Year, endDate.Year),

            _ => throw new BusinessException("Parâmetro groupBy inválido. Use: day, week, month ou year.")
        };
    }

    private static List<SalesChartPoint> FillDays(
        Dictionary<DateTime, (decimal Total, int Count)> data,
        DateTime start, DateTime end)
    {
        var result = new List<SalesChartPoint>();
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            var v = data.GetValueOrDefault(d);
            result.Add(new(d.ToString("dd/MM/yy"), v.Total, v.Count));
        }
        return result;
    }

    private static List<SalesChartPoint> FillWeeks(
        Dictionary<DateTime, (decimal Total, int Count)> data,
        DateTime start, DateTime end)
    {
        var result = new List<SalesChartPoint>();
        for (var d = start; d <= end; d = d.AddDays(7))
        {
            var v = data.GetValueOrDefault(d);
            result.Add(new(d.ToString("dd/MM/yy"), v.Total, v.Count));
        }
        return result;
    }

    private static List<SalesChartPoint> FillMonths(
        Dictionary<DateTime, (decimal Total, int Count)> data,
        DateTime start, DateTime end)
    {
        var months = new[] {
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        };
        var result = new List<SalesChartPoint>();
        for (var d = start; d <= end; d = d.AddMonths(1))
        {
            var v = data.GetValueOrDefault(d);
            result.Add(new($"{months[d.Month - 1]}/{d.Year}", v.Total, v.Count));
        }
        return result;
    }

    private static List<SalesChartPoint> FillYears(
        Dictionary<int, (decimal Total, int Count)> data,
        int start, int end)
    {
        return Enumerable.Range(start, end - start + 1)
            .Select(y => {
                var v = data.GetValueOrDefault(y);
                return new SalesChartPoint(y.ToString(), v.Total, v.Count);
            })
            .ToList();
    }

    private static DateTime GetMonday(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }
}
