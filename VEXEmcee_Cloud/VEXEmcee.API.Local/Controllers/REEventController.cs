using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class REEventController : ControllerBase
	{
		[HttpGet("geteventlist")]
		public async Task<IActionResult> GetEventList([FromQuery] int programID, [FromQuery] string region, [FromQuery] string sku, [FromQuery] int? pageSize, [FromQuery] int? page)
		{
			GetREEventListRequest getREEventListRequest = new()
			{
				Page = page,
				PageSize = pageSize,
				ProgramID = programID,
				Region = region,
				SKU = sku
			};

			GetREEventListResponse eventResponse = await PublicMethods.GetREEventList(getREEventListRequest);

			IActionResult response;
			if (eventResponse.Success)
			{
				response = Ok(eventResponse);
			}
			else
			{
				switch (eventResponse.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						response = StatusCode((int)System.Net.HttpStatusCode.InternalServerError, eventResponse);
						break;
					default:
						response = BadRequest(eventResponse);
						break;
				}
			}
			return response;
		}
	}
}
