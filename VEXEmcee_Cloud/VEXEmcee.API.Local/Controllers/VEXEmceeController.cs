using Microsoft.AspNetCore.Mvc;
using RE.Objects;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class VEXEmceeController : ControllerBase
	{
		private readonly ILogger<VEXEmceeController> _logger;

		public VEXEmceeController(ILogger<VEXEmceeController> logger)
		{
			_logger = logger;
		}

		[HttpGet]
		public async Task<List<Event>> GetEventList()
		{
			PaginatedEvent paginatedResponse = await RE.API.Events.List(new()
			{
				Season = [197]
			});

			PaginatedMatch paginatedMatch = await RE.API.Events.DivisionMatches(new()
			{
				ID = 55713,
				DivisionID = 1
			});
			if (paginatedMatch?.Data != null && paginatedMatch.Data.Count > 0)
			{
				MatchRoundType roundType = paginatedMatch.Data[0].Round;
			}

			return paginatedResponse.Data;
		}
	}
}
