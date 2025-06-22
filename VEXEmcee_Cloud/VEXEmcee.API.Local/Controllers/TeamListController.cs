using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class TeamListController : ControllerBase
	{
		[HttpGet("getteamlist")]
		public async Task<IActionResult> GetTeamList([FromQuery] string sessionID)
		{
			GetTeamListRequest request = new()
			{
				Session = sessionID
			};

			GetTeamListResponse teamListResponse = await PublicMethods.GetTeamList(request);

			IActionResult response;
			if (teamListResponse.Success)
			{
				response = Ok(teamListResponse);
			}
			else
			{
				switch (teamListResponse.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						response = StatusCode((int)System.Net.HttpStatusCode.InternalServerError, teamListResponse);
						break;
					default:
						response = BadRequest(teamListResponse);
						break;
				}
			}
			return response;
		}
	}
}
