using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class MatchInfoController : ControllerBase
	{
		[HttpGet("getmatchinfo")]
		public async Task<IActionResult> GetMatchList([FromQuery] string sessionID, [FromQuery] int matchID)
		{
			GetMatchInfoRequest request = new()
			{
				MatchID = matchID,
				Session = sessionID
			};

			GetMatchInfoResponse matchInfoResponse = await PublicMethods.GetMatchInfo(request);

			IActionResult response;
			if (matchInfoResponse.Success)
			{
				response = Ok(matchInfoResponse);
			}
			else
			{
				switch (matchInfoResponse.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						response = StatusCode((int)System.Net.HttpStatusCode.InternalServerError, matchInfoResponse);
						break;
					default:
						response = BadRequest(matchInfoResponse);
						break;
				}
			}
			return response;
		}
	}
}
