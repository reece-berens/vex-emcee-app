using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using VEXEmcee.Objects.Data.ClientApp.Display;

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
			response.TeamInfo = new();

			List<Definitions.Team> teamsAtEvent = await Accessors.Team.GetByTeamIDList(thisEvent.Teams_denorm);
			Definitions.Team thisTeam = teamsAtEvent.FirstOrDefault(t => t.ID == request.TeamID);
			Definitions.TeamStats_CurrentEvent teamStats_CurrentEvent = await Accessors.TeamStats_CurrentEvent.GetByCompositeKey(thisEvent.ID, request.TeamID);
			Definitions.TeamStats_Season teamStats_Season = await Accessors.TeamStats_Season.GetByCompositeKey(thisEvent.SeasonID, request.TeamID);
			List<Definitions.LiveMatch> liveMatches = await Accessors.LiveMatch.GetByEventID(thisEvent.ID);
            if (thisTeam != null && teamStats_CurrentEvent != null && teamStats_Season != null)
			{
				response.TeamInfo.ID = thisTeam.ID;
				response.TeamInfo.Location = $"{thisTeam.Organization} - {thisTeam.CityState_denorm}";
				response.TeamInfo.Number = thisTeam.Number;
				response.TeamInfo.TeamName = thisTeam.TeamName;
				response.TeamInfo.Sections = [];

				//populate the next and previous team IDs based on sort order of team number
				Dictionary<int, int> teamSort = Helpers.Team.SortTeamsByNumber(teamsAtEvent);
				int thisTeamSortOrder = teamSort.TryGetValue(thisTeam.ID, out int sortOrder) ? sortOrder : int.MaxValue;
				if (thisTeamSortOrder == 0)
				{
					//this is the first team in the list, previous team will be largest sort value, next team will be order 1
					response.TeamInfo.PreviousTeamID = teamSort.FirstOrDefault(kvp => kvp.Value == teamSort.Count - 1).Key;
					response.TeamInfo.NextTeamID = teamSort.FirstOrDefault(kvp => kvp.Value == 1).Key;
				}
				else if (thisTeamSortOrder == teamSort.Count - 1)
				{
					//if this is the last team in the list, previous team will be order count - 1, next team will be order 0
					response.TeamInfo.PreviousTeamID = teamSort.FirstOrDefault(kvp => kvp.Value == teamSort.Count - 2).Key;
					response.TeamInfo.NextTeamID = teamSort.FirstOrDefault(kvp => kvp.Value == 0).Key;
				}
				else
				{
					//all others teams, previous team will be order - 1, next team will be order + 1
					response.TeamInfo.PreviousTeamID = teamSort.FirstOrDefault(kvp => kvp.Value == thisTeamSortOrder - 1).Key;
					response.TeamInfo.NextTeamID = teamSort.FirstOrDefault(kvp => kvp.Value == thisTeamSortOrder + 1).Key;
				}

				//for the moment, I just want to populate current event WLT and season WLT with percentages to ensure it works
				//come back in and add other stats later on
				SectionHeader currentEventSection = new()
				{
					Name = "This Event",
					Order = 0,
					Display = []
				};
				currentEventSection.Display.Add(new()
				{
					SectionLabel = "Qualification W-L-T",
					SectionData = [
						$"{teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.Win ?? 0}-{teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.Loss ?? 0}-{teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.Tie ?? 0}",
						$"{teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.WinPercentage:P1} Win Rate"
					]
				});
				currentEventSection.Display.Add(new()
				{
					SectionLabel = "Qualifications Ranking",
					SectionData = [
						teamStats_CurrentEvent.EventStats?.CurrentQualiRank != null ? $"#{teamStats_CurrentEvent.EventStats.CurrentQualiRank}" : "N/A"
					]
				});
				currentEventSection.Display.Add(new()
				{
					SectionLabel = "WP-SP-AP",
					SectionData = [
						$"Total: {teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.WPTotal ?? 0} WP - {teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.SPTotal ?? 0} SP - {teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.APTotal ?? 0} AP",
						$"Average per match: {teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.WPAvg:F1} WP - {teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.SPAvg:F1} SP - {teamStats_CurrentEvent.EventStats?.DenormData?.QualiMatches?.APAvg:F1} AP"
					]
				});
                SectionDisplay skillsResults = new()
				{
					SectionLabel = "Skills Results",
					SectionData = []
				};
				if (teamStats_CurrentEvent.EventStats.Skills.TryGetValue("driver", out var driverSkills))
				{
					skillsResults.SectionData.Add($"Driver: {driverSkills.Attempts} attempts, {driverSkills.HighScore} high score");
				}
                if (teamStats_CurrentEvent.EventStats.Skills.TryGetValue("programming", out var progSkills))
                {
                    skillsResults.SectionData.Add($"Programming: {progSkills.Attempts} attempts, {progSkills.HighScore} high score");
                }
                currentEventSection.Display.Add(skillsResults);
				
				List<Definitions.LiveMatch> teamMatchesThisEvent = [..liveMatches
					.Where(m => 
						m.Alliances.Any(a => a.Teams.Any(t => t.ID == thisTeam.ID))
						&& (m.ScoreFinalized || m.BlueScore > 0 || m.RedScore > 0)
					)
				];
				List<Definitions.LiveMatchAlliance> teamAlliances = [];
				foreach (Definitions.LiveMatch match in teamMatchesThisEvent)
				{
					Definitions.LiveMatchAlliance alliance = match.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.ID == thisTeam.ID));
					if (alliance != null)
					{
						teamAlliances.Add(alliance);
					}
				}
				int pointsScored = teamAlliances.Sum(a => a.Score);
				currentEventSection.Display.Add(new()
				{
					SectionLabel = "Points Scored",
					SectionData = [
						$"Total: {pointsScored} points",
						$"Average per match: {(teamMatchesThisEvent.Count > 0 ? pointsScored / (double)teamMatchesThisEvent.Count : 0):F1} points"
					]
				});

                response.TeamInfo.Sections.Add(currentEventSection);

				SectionHeader seasonSection = new()
				{
					Name = "This Season (including this event)",
					Order = 1,
					Display = []
				};
				seasonSection.Display.Add(new()
				{
					SectionLabel = "W-L-T",
					SectionData = [
						$"{teamStats_CurrentEvent?.CompiledStats?.DenormData?.AllMatches?.Win ?? 0}-{teamStats_CurrentEvent?.CompiledStats?.DenormData?.AllMatches?.Loss ?? 0}-{teamStats_CurrentEvent?.CompiledStats?.DenormData?.AllMatches?.Tie ?? 0}",
						$"{teamStats_CurrentEvent?.CompiledStats?.DenormData?.AllMatches?.WinPercentage:P1} Win Rate"
					]
				});
				seasonSection.Display.Add(new()
				{
					SectionLabel = "WP-SP-AP",
					SectionData = [
						$"Total: {teamStats_CurrentEvent?.CompiledStats?.DenormData?.QualiMatches?.WPTotal ?? 0} WP - {teamStats_CurrentEvent?.CompiledStats?.DenormData?.QualiMatches?.SPTotal ?? 0} SP - {teamStats_CurrentEvent?.CompiledStats?.DenormData?.QualiMatches?.APTotal ?? 0} AP",
                        $"Average per match: {teamStats_CurrentEvent?.CompiledStats?.DenormData?.QualiMatches?.WPAvg:F1} WP - {teamStats_CurrentEvent?.CompiledStats?.DenormData?.QualiMatches?.SPAvg:F1} SP - {teamStats_CurrentEvent?.CompiledStats?.DenormData?.QualiMatches?.APAvg:F1} AP"
                    ]
				});
				response.TeamInfo.Sections.Add(seasonSection);
			}
		}
	}
}
