using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class MatchListController : ControllerBase
	{
		[HttpGet("getmatchlist")]
		public async Task<IActionResult> GetMatchList([FromQuery] string sessionID)
		{
			GetMatchListRequest request = new() 
			{
				Session = sessionID
			};

			GetMatchListResponse matchListResponse = await PublicMethods.GetMatchList(request);

			IActionResult response;
			if (matchListResponse.Success)
			{
				response = Ok(matchListResponse);
			}
			else
			{
				switch (matchListResponse.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						response = StatusCode((int)System.Net.HttpStatusCode.InternalServerError, matchListResponse);
						break;
					default:
						response = BadRequest(matchListResponse);
						break;
				}
			}
			return response;
		}
	}
}
