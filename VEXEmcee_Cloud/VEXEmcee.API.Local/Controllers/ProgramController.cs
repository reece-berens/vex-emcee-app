using Microsoft.AspNetCore.Mvc;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Local.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class ProgramController : ControllerBase
	{
		[HttpGet("getselectableprograms")]
		public async Task<IActionResult> GetSelectablePrograms()
		{
			GetSelectableProgramsRequest request = new();

			GetSelectableProgramsResponse programResponse = await PublicMethods.GetSelectablePrograms(request);

			IActionResult response;
			if (programResponse.Success)
			{
				response = Ok(programResponse);
			}
			else
			{
				switch (programResponse.StatusCode)
				{
					case System.Net.HttpStatusCode.InternalServerError:
						response = StatusCode((int)System.Net.HttpStatusCode.InternalServerError, programResponse);
						break;
					default:
						response = BadRequest(programResponse);
						break;
				}
			}
			return response;
		}
	}
}
