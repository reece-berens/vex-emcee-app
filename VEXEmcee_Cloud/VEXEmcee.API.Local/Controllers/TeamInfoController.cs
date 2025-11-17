using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class TeamInfoController : ControllerBase
	{
		[HttpGet("getteaminfo")]
		public async Task<IActionResult> GetTeamInfo([FromQuery] string sessionID, [FromQuery] int teamID)
		{
			GetTeamInfoRequest request = new()
			{
				TeamID = teamID,
				Session = sessionID
			};

			GetTeamInfoResponse teamInfoResponse = await PublicMethods.GetTeamInfo(request);

			IActionResult response;
			if (teamInfoResponse.Success)
			{
				response = Ok(teamInfoResponse);
			}
			else
			{
				switch (teamInfoResponse.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						response = StatusCode((int)System.Net.HttpStatusCode.InternalServerError, teamInfoResponse);
						break;
					default:
						response = BadRequest(teamInfoResponse);
						break;
				}
			}
			return response;
		}
	}
}
