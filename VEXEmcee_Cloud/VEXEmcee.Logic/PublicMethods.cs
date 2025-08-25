using System.Reflection;
using VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using VEXEmcee.Objects.Exceptions;
using VEXEmcee.Objects.Lambda;

namespace VEXEmcee.Logic
{
	public static class PublicMethods
	{
		public static async Task<bool> BuildEventStats(BuildEventStatsRequest request)
		{
			bool returnValue = await InternalLogic.BuildEventStats.Base.BuildEventStats(request);
			return returnValue;
		}

		/// <summary>
		/// Retrieves info for a single match.
		/// </summary>
		/// <remarks>This method handles exceptions internally and returns a response object with error details if an
		/// error occurs during processing. The caller does not need to catch exceptions explicitly.</remarks>
		/// <param name="request">The request object containing the criteria for retrieving the match info. This parameter cannot be <see
		/// langword="null"/>.</param>
		/// <returns>A <see cref="GetMatchInfoResponse"/> object containing the match info and additional response details. If an
		/// error occurs, the response will include an error message, a status code of  <see
		/// cref="System.Net.HttpStatusCode.InternalServerError"/>, and an empty match object.</returns>
		public static async Task<GetMatchInfoResponse> GetMatchInfo(GetMatchInfoRequest request)
		{
			try
			{
				if (request == null)
				{
					throw new ArgumentNullException(nameof(request), "Request cannot be null.");
				}
				GetMatchInfoResponse response = await InternalLogic.MatchInfo.Base.GetMatchInfo(request);
				return response;
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
		}

		/// <summary>
		/// Retrieves info for a single team.
		/// </summary>
		/// <remarks>This method handles exceptions internally and returns a response object with error details if an
		/// error occurs during processing. The caller does not need to catch exceptions explicitly.</remarks>
		/// <param name="request">The request object containing the criteria for retrieving the team info. This parameter cannot be <see
		/// langword="null"/>.</param>
		/// <returns>A <see cref="GetTeamInfoResponse"/> object containing the list of teams and additional response details. If an
		/// error occurs, the response will include an error message, a status code of  <see
		/// cref="System.Net.HttpStatusCode.InternalServerError"/>, and an empty info object.</returns>
		public static async Task<GetTeamInfoResponse> GetTeamInfo(GetTeamInfoRequest request)
		{
			try
			{
				if (request == null)
				{
					throw new ArgumentNullException(nameof(request), "Request cannot be null.");
				}
				GetTeamInfoResponse response = await InternalLogic.TeamInfo.Base.GetTeamInfo(request);
				return response;
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
		}

		/// <summary>
		/// Retrieves a list of matches based on the session information.
		/// </summary>
		/// <remarks>This method handles exceptions internally and returns a response object with error details if an
		/// error occurs during processing. The caller does not need to catch exceptions explicitly.</remarks>
		/// <param name="request">The request object containing the criteria for retrieving the match list. This parameter cannot be <see
		/// langword="null"/>.</param>
		/// <returns>A <see cref="GetMatchListResponse"/> object containing the list of matches and additional response details. If an
		/// error occurs, the response will include an error message, a status code of  <see
		/// cref="System.Net.HttpStatusCode.InternalServerError"/>, and an empty match list.</returns>
		public static async Task<GetMatchListResponse> GetMatchList(GetMatchListRequest request)
		{
			try
			{
				if (request == null)
				{
					throw new ArgumentNullException(nameof(request), "Request cannot be null.");
				}
				GetMatchListResponse response = await InternalLogic.MatchList.Base.GetMatchList(request);
				return response;
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					Matches = [],
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					Matches = [],
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
		}

		/// <summary>
		/// Retrieves a list of teams based on the session information.
		/// </summary>
		/// <remarks>This method handles exceptions internally and returns a response object with error details if an
		/// error occurs during processing. The caller does not need to catch exceptions explicitly.</remarks>
		/// <param name="request">The request object containing the criteria for retrieving the team list. This parameter cannot be <see
		/// langword="null"/>.</param>
		/// <returns>A <see cref="GetTeamListResponse"/> object containing the list of teams and additional response details. If an
		/// error occurs, the response will include an error message, a status code of  <see
		/// cref="System.Net.HttpStatusCode.InternalServerError"/>, and an empty match list.</returns>
		public static async Task<GetTeamListResponse> GetTeamList(GetTeamListRequest request)
		{
			try
			{
				if (request == null)
				{
					throw new ArgumentNullException(nameof(request), "Request cannot be null.");
				}
				GetTeamListResponse response = await InternalLogic.TeamList.Base.GetTeamList(request);
				return response;
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					Teams = [],
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					Teams = [],
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
		}

		/// <summary>
		/// Retrieves a list of events from the RE API based on the specified request parameters.
		/// </summary>
		/// <remarks>This method handles exceptions internally and returns a standardized error response in case of
		/// failure. The response includes details such as the error message, HTTP status code, and pagination
		/// defaults.</remarks>
		/// <param name="request">The request object containing parameters for filtering and pagination. Must not be <see langword="null"/>.</param>
		/// <returns>A <see cref="GetREEventListResponse"/> object containing the list of events, pagination details,  and status
		/// information. If an error occurs, the response will include an error message,  a status code of <see
		/// cref="System.Net.HttpStatusCode.InternalServerError"/>, and an empty event list.</returns>
		public static async Task<GetREEventListResponse> GetREEventList(GetREEventListRequest request)
		{
			try
			{
				if (request == null)
				{
					throw new ArgumentNullException(nameof(request), "Request cannot be null.");
				}
				GetREEventListResponse response = await InternalLogic.REEvent.GetREEventList(request);
				return response;
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
					Events = [],
					NextPage = 1,
					PageSize = request.PageSize ?? 25,
					TotalCount = 0
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
					Events = [],
					NextPage = 1,
					PageSize = request.PageSize ?? 25,
					TotalCount = 0
				};
			}	
		}

		/// <summary>
		/// Retrieves a list of selectable programs.
		/// </summary>
		/// <remarks>This method processes the request asynchronously and returns a response object that includes the
		/// list of programs that a user can select. If an error occurs during processing, the
		/// response will include an appropriate error message and status code.</remarks>
		/// <param name="request">The request object containing the criteria for retrieving selectable programs. This parameter cannot be <see
		/// langword="null"/>.</param>
		/// <returns>A <see cref="GetSelectableProgramsResponse"/> object containing the list of selectable programs, along with status
		/// information and any error messages if applicable.</returns>
		public static async Task<GetSelectableProgramsResponse> GetSelectablePrograms(GetSelectableProgramsRequest request)
		{
			try
			{
				if (request == null)
				{
					throw new ArgumentNullException(nameof(request), "Request cannot be null.");
				}
				GetSelectableProgramsResponse response = await InternalLogic.Program.GetSelectablePrograms(request);
				return response;
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
					Programs = []
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
					Programs = []
				};
			}
		}

		/// <summary>
		/// Registers a new session based on the provided <see cref="RegisterNewSessionRequest"/>.
		/// Calls the internal session registration logic, handles any exceptions, and returns a response
		/// indicating success or failure, along with the generated session ID if successful.
		/// </summary>
		/// <param name="request">The request object containing any data needed to register a session.</param>
		/// <returns>
		/// A <see cref="RegisterNewSessionResponse"/> object containing the session ID if successful,
		/// or error information if the registration fails.
		/// </returns>
		public static async Task<RegisterNewSessionResponse> RegisterNewSession(RegisterNewSessionRequest request)
		{
			RegisterNewSessionResponse response = new()
			{
				Success = false,
				StatusCode = System.Net.HttpStatusCode.OK,
			};
			try
			{
				string newSessionID = await InternalLogic.Session.RegisterNewSession(request);
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

		/// <summary>
		/// Registers a session event division based on the provided request parameters.
		/// </summary>
		/// <remarks>This method validates the input parameters and processes the request asynchronously. If the
		/// request parameters are invalid, a response with a <see cref="System.Net.HttpStatusCode.BadRequest"/> status code
		/// is returned. If an error occurs during processing, a response with a <see
		/// cref="System.Net.HttpStatusCode.InternalServerError"/> status code is returned.</remarks>
		/// <param name="request">The request object containing the session identifier, event ID, and division ID. All fields must be valid and
		/// non-null.</param>
		/// <returns>A <see cref="RegisterSessionEventDivisionResponse"/> object containing the result of the operation. The response
		/// includes a success flag, status code, and an error message if applicable.</returns>
		public static async Task<RegisterSessionEventDivisionResponse> RegisterSessionEventDivision(RegisterSessionEventDivisionRequest request)
		{
			try
			{
				if (request == null || string.IsNullOrWhiteSpace(request.Session) || request.EventID <= 0 || request.DivisionID <= 0)
				{
					return new()
					{
						ErrorMessage = "Invalid request parameters. Please ensure all required fields are provided.",
						StatusCode = System.Net.HttpStatusCode.BadRequest,
						Success = false
					};
				}
				else
				{
					RegisterSessionEventDivisionResponse response = await InternalLogic.Session.RegisterSessionEventDivision(request);
					return response;
				}
			}
			catch (VEXEmceeBaseException ex)
			{
				ex.LogException();
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return new()
				{
					ErrorMessage = "An error occurred while processing your request. Please try again later.",
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
				};
			}
		}

		public static async Task ValidateCurrentEventStats(int eventID)
		{
			await InternalLogic.BuildEventStats.Base.ValidateCurrentEventStats(eventID);
		}

		/// <summary>
		/// Validates whether the specified session exists and is active.
		/// </summary>
		/// <param name="request">The request containing the session identifier to validate.</param>
		/// <returns>A <see cref="ValidateSessionResponse"/> indicating the result of the validation. The <see
		/// cref="ValidateSessionResponse.Success"/> property will be <see langword="true"/> if the session is valid; 
		/// otherwise, <see langword="false"/>.</returns>
		public static async Task<ValidateSessionResponse> ValidateSession(ValidateSessionRequest request)
		{
			/*
				TBD - determine if session expiration should happen somewhere in here or if it will happen by some separate AWS process
			*/
			Session session = await InternalLogic.Session.GetSession(request.Session);
			if (session == null)
			{
				return new()
				{
					Success = false
				};
			}
			else
			{
				return new()
				{
					Success = true
				};
			}
		}
	}
}
