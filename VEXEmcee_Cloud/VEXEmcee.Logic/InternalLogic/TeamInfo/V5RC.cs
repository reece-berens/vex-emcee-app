using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.Logic.InternalLogic.TeamInfo
{
	internal class V5RC
	{
		/// <summary>
		/// Retrieves info for the specified team and populates the response object in the V5RC format.
		/// </summary>
		/// <remarks>This method fetches team data associated with the specified event and updates the response
		/// object. The team data may be cached or retrieved from an external API, depending on the timing of the last
		/// request. Ensure that the <paramref name="request"/> and <paramref name="response"/> objects are properly
		/// initialized before calling this method.</remarks>
		/// <param name="request">The request object containing parameters for retrieving team data.</param>
		/// <param name="response">The response object to be populated with the team info.</param>
		/// <param name="thisEvent">The event for which team data is being retrieved.</param>
		internal static async Task GetTeamInfo(GetTeamInfoRequest request, GetTeamInfoResponse response, Definitions.Event thisEvent)
		{
			//TODO - fill out the response information based on match data pulled from RE API and stored in LiveMatches table
			//possibly have some sort of "previous API request" time that we can use to determine if we need to pull new data
			//ex. don't pull new data from RE if the last request was made within the last minute or two
			//that will probably need to be stored based on the event ID so that it can be tracked per event that's happening...
			//probably store in the database or some memory cache so that it persists between different lambda context sessions
			response.TeamInfo = new();
		}
	}
}
