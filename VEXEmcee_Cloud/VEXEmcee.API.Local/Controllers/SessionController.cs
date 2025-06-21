using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class SessionController : ControllerBase
	{
		[HttpPost("registernewsession")]
		public async Task<IActionResult> RegisterNewSession([FromBody] Objects.API.Request.RegisterNewSessionRequest request)
		{
			RegisterNewSessionResponse sessionResponse = await PublicMethods.RegisterNewSession(request);

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

		[HttpPost("registersessioneventdivision")]
		public async Task<IActionResult> RegisterSessionEventDivision([FromBody] Objects.API.Request.RegisterSessionEventDivisionRequest request)
		{
			RegisterSessionEventDivisionResponse response = await PublicMethods.RegisterSessionEventDivision(request);
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
