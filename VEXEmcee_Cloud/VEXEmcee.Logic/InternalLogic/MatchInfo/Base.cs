using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.Logic.InternalLogic.MatchInfo
{
	internal class Base
	{
		/// <summary>
		/// Retrieves info for a single match.
		/// </summary>
		/// <remarks>This method determines the validity of the session and its associated event and division. If the
		/// session is invalid or lacks a linked event or division, an error message is returned in the response. If the
		/// linked event's statistics are not ready, the response indicates that the event stats are still loading. If the
		/// event's statistics are ready, the method retrieves the match info using the appropriate program logic.</remarks>
		/// <param name="request">The request containing the session ID and other parameters required to retrieve the match info.</param>
		/// <returns>A <see cref="GetMatchInfoResponse"/> object containing the match info, success status, and additional information
		/// about the operation. If the session is invalid or the event's program is unsupported, the response includes an
		/// error message.</returns>
		/// <exception cref="LogicException">Thrown if the event linked to the session does not exist.</exception>
		internal static async Task<GetMatchInfoResponse> GetMatchInfo(GetMatchInfoRequest request)
		{
			GetMatchInfoResponse response = new()
			{
				Success = true,
				StatusCode = System.Net.HttpStatusCode.OK,
			};
			//From here, get the event ID and division ID from the session request
			//If the session doesn't have a linked event/division, return error message
			//If the linked event/division doesn't have stats ready, set that field on the response and return success
			//If all stats are ready, find the program used for the event and call the appropriate helper method to get the match info
			Definitions.Session thisSession = await Accessors.Session.GetSessionByID(request.Session);
			if (thisSession == null || thisSession.SelectedEventID == 0 || thisSession.SelectedDivisionID == 0)
			{
				response.ErrorMessage = "The session is not valid.";
				response.Matches = [];
				response.StatusCode = System.Net.HttpStatusCode.BadRequest;
				response.Success = false;
			}
			else
			{
				Definitions.Event thisEvent = await Accessors.Event.GetEventByID(thisSession.SelectedEventID) ??
					throw new LogicException(3, $"The event linked to the session does not exist. - {request.Session} {thisSession.SelectedEventID}");
				if (thisEvent.StatsReady)
				{
					//TODO validate the match ID in the request exists in the event
					switch (thisEvent.ProgramID_denorm)
					{
						case 1:
							//V5RC
							await V5RC.GetMatchInfo(request, response, thisEvent);
							response.ProgramAbbreviation = "V5RC";
							break;
						default:
							response.ErrorMessage = "The selected event's program is not supprted for match info retrieval.";
							response.Matches = [];
							response.Success = false;
							response.StatusCode = System.Net.HttpStatusCode.BadRequest;
							break;
					}
				}
				else
				{
					response.EventStatsLoading = true;
					response.Matches = [];
				}
			}

			return response;
		}
	}
}
