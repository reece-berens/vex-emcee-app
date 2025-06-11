using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class SessionController : ControllerBase
	{
		[HttpPost("registersession")]
		public async Task<IActionResult> RegisterSession([FromBody] Objects.API.Request.RegisterSessionRequest request)
		{
			RegisterSessionResponse sessionResponse = await PublicMethods.RegisterSession(request);

			IActionResult response;
			if (sessionResponse.Success)
			{
				response = Ok(sessionResponse);
			}
			else
			{
				switch (sessionResponse.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						response = StatusCode((int)System.Net.HttpStatusCode.InternalServerError, sessionResponse);
						break;
					default:
						response = BadRequest(sessionResponse);
						break;
				}
			}
			return response;
		}

		[HttpPost("validatesession")]
		public async Task<IActionResult> ValidateSession([FromBody] Objects.API.Request.ValidateSessionRequest request)
		{
			ValidateSessionResponse response = await PublicMethods.ValidateSession(request);
			if (response.Success)
			{
				return Ok(response);
			}
			else
			{
				switch (response.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						return StatusCode((int)System.Net.HttpStatusCode.InternalServerError, response);
					default:
						return BadRequest(response);
				}
			}
		}
  }
}
