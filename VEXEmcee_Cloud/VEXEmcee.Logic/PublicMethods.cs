using System.Reflection;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.Logic
{
	public static class PublicMethods
	{
		/// <summary>
		/// Registers a new session based on the provided <see cref="RegisterSessionRequest"/>.
		/// Calls the internal session registration logic, handles any exceptions, and returns a response
		/// indicating success or failure, along with the generated session ID if successful.
		/// </summary>
		/// <param name="request">The request object containing any data needed to register a session.</param>
		/// <returns>
		/// A <see cref="RegisterSessionResponse"/> object containing the session ID if successful,
		/// or error information if the registration fails.
		/// </returns>
		public static async Task<RegisterSessionResponse> RegisterSession(RegisterSessionRequest request)
		{
			RegisterSessionResponse response = new()
			{
				Success = false,
				StatusCode = System.Net.HttpStatusCode.OK,
			};
			try
			{
				string newSessionID = await InternalLogic.Session.RegisterSession(request);
				if (string.IsNullOrWhiteSpace(newSessionID))
				{
					//an error occurred generating session ID, return error response
					response.ErrorMessage = "An error occurred while generating the session ID. Please try again later.";
					response.StatusCode = System.Net.HttpStatusCode.InternalServerError;
				}
				else
				{
					//session ID generated successfully, return success response
					response.Session = newSessionID;
					response.Success = true;
				}
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				response.ErrorMessage = "An error occurred while processing your request. Please try again later.";
				response.StatusCode = System.Net.HttpStatusCode.InternalServerError;
				response.Success = false;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				response.ErrorMessage = "An error occurred while processing your request. Please try again later.";
				response.StatusCode = System.Net.HttpStatusCode.InternalServerError;
				response.Success = false;
			}
			return response;
		}
	}
}
