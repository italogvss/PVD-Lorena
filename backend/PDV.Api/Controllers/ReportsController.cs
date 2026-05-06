using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PDV.Application.Interfaces;

namespace PDV.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController(IReportService service) : ControllerBase
{
    [HttpGet("sales/chart")]
    public async Task<IActionResult> GetSalesChart(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string groupBy = "day")
    {
        var result = await service.GetSalesChartAsync(startDate, endDate, groupBy);
        return Ok(result);
    }
}
