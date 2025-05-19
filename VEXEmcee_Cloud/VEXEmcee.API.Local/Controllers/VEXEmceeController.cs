using Microsoft.AspNetCore.Mvc;

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
	}
}
