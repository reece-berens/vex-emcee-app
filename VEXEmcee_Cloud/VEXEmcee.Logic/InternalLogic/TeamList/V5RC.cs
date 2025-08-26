using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.Logic.InternalLogic.TeamList
{
	internal class V5RC
	{
		/// <summary>
		/// Retrieves a list of teams for the specified event and populates the response object in the V5RC format.
		/// </summary>
		/// <remarks>This method fetches team data associated with the specified event and updates the response
		/// object. The team data may be cached or retrieved from an external API, depending on the timing of the last
		/// request. Ensure that the <paramref name="request"/> and <paramref name="response"/> objects are properly
		/// initialized before calling this method.</remarks>
		/// <param name="request">The request object containing parameters for retrieving team data.</param>
		/// <param name="response">The response object to be populated with the list of teams.</param>
		/// <param name="thisEvent">The event for which team data is being retrieved.</param>
		internal static async Task GetTeamList(GetTeamListRequest request, GetTeamListResponse response, Definitions.Event thisEvent)
		{
			//TODO - fill out the response information based on match data pulled from RE API and stored in LiveMatches table
			//possibly have some sort of "previous API request" time that we can use to determine if we need to pull new data
			//ex. don't pull new data from RE if the last request was made within the last minute or two
			//that will probably need to be stored based on the event ID so that it can be tracked per event that's happening...
			//probably store in the database or some memory cache so that it persists between different lambda context sessions
			response.Teams = [];

			//have the list of all team IDs for the event in thisEvent.Teams_denorm, so use that to get name and qualification ranking data for each team
			List<Definitions.Team> dbTeams = await Accessors.Team.GetByTeamIDList(thisEvent.Teams_denorm);
			List<Definitions.TeamStats_CurrentEvent> dbTeamStats = await Accessors.TeamStats_CurrentEvent.GetByEventID(thisEvent.ID);
			List<int> thisDivisionTeams = thisEvent.DivisionTeams != null && request.SessionDivisionID.HasValue && thisEvent.DivisionTeams.TryGetValue(request.SessionDivisionID.Value, out List<int> value) ? value : [];
			Dictionary<int, int> teamSortOrder = Helpers.Team.SortTeamsByNumber(dbTeams);

			foreach (Definitions.Team team in dbTeams)
			{
				Definitions.TeamStats_CurrentEvent teamStats = dbTeamStats.FirstOrDefault(ts => ts.TeamID == team.ID);
				Objects.Data.ClientApp.TeamList.V5RC outputTeam = new()
				{
					ID = team.ID,
					InDivision = thisDivisionTeams.Contains(team.ID),
					Number = team.Number,
					NumberSortOrder = teamSortOrder.TryGetValue(team.ID, out int sortOrder) ? sortOrder : int.MaxValue,
					TeamName = team.TeamName
				};
				response.Teams.Add(outputTeam);
				if (teamStats != null)
				{
					outputTeam.QualiRank = teamStats.EventStats?.CurrentQualiRank;
					QualiMatchStats eventQualiStats = teamStats.EventStats?.DenormData?.QualiMatches;
					if (eventQualiStats != null)
					{
						outputTeam.EventWLT = $"{eventQualiStats.Win}-{eventQualiStats.Loss}-{eventQualiStats.Tie}";
					}
				}
			}
		}
	}
}
