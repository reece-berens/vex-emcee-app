using VEXEmcee.DB.Dynamo.Definitions;

namespace VEXEmcee.Logic.InternalLogic.BuildEventStats.V5RC
{
	internal static class EventDivision
	{
		internal static async Task ProcessDivision(References internalRefs, int divisionID)
		{
			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.V5RC.EventDivision.ProcessDivision: BEGIN - Division {divisionID}");
			//only process ranking and match data if the event is finalized
			if (internalRefs.Event.Finalized)
			{
				//Get list of rankings and matches for the division
				List<RE.Objects.Ranking> rankingsAtDivision = await Helpers.REAPI.Event.GetRankingsAtEventDivision(internalRefs.Event.ID, divisionID);
				List<RE.Objects.MatchObj> matchesAtDivision = await Helpers.REAPI.Event.GetMatchesAtEventDivision(internalRefs.Event.ID, divisionID);
				internalRefs.Event.DivisionTeams.Add(divisionID, []);
				//find all teams in the rankings and matches, ensure they exist in the Teams_denorm list
				HashSet<int> teamsInDivision = new();
				foreach (RE.Objects.Ranking ranking in rankingsAtDivision)
				{
					if (!teamsInDivision.Contains(ranking.Team.Id))
					{
						teamsInDivision.Add(ranking.Team.Id);
						if (!internalRefs.Event.Teams_denorm.Contains(ranking.Team.Id))
						{
							internalRefs.Event.Teams_denorm.Add(ranking.Team.Id);
						}
					}
				}
				foreach (RE.Objects.MatchObj match in matchesAtDivision)
				{
					foreach (RE.Objects.Alliance team in match.Alliances)
					{
						foreach (RE.Objects.AllianceTeam teamObj in team.Teams)
						{
							if (!teamsInDivision.Contains(teamObj.Team.Id))
							{
								teamsInDivision.Add(teamObj.Team.Id);
								if (!internalRefs.Event.Teams_denorm.Contains(teamObj.Team.Id))
								{
									internalRefs.Event.Teams_denorm.Add(teamObj.Team.Id);
								}
							}
						}
					}
				}

				foreach (int teamID in teamsInDivision)
				{
					internalRefs.Event.DivisionTeams[divisionID].Add(teamID);
					//ensure the team exists in the TeamStats_Season and TeamStats_CurrentEvent tables
					if (!internalRefs.Update_TeamStats_Season.TryGetValue(TeamStats_Season.GetCompositeKey(internalRefs.Event.SeasonID, teamID), out TeamStats_Season teamStats_Season))
					{
						teamStats_Season = await DB.Dynamo.Accessors.TeamStats_Season.GetByCompositeKey(internalRefs.Event.SeasonID, teamID);
						teamStats_Season ??= Helpers.TeamStats_Season.CreateNew(internalRefs.Event.SeasonID, teamID);
						internalRefs.Update_TeamStats_Season.Add(teamStats_Season.CompositeKey, teamStats_Season);
					}
					if (!internalRefs.Update_TeamStats_CurrentEvent.TryGetValue(TeamStats_CurrentEvent.GetCompositeKey(internalRefs.Event.ID, teamID), out TeamStats_CurrentEvent teamStats_CurrentEvent))
					{
						teamStats_CurrentEvent = await DB.Dynamo.Accessors.TeamStats_CurrentEvent.GetByCompositeKey(internalRefs.Event.ID, teamID);
						teamStats_CurrentEvent ??= Helpers.TeamStats_CurrentEvent.CreateNew(internalRefs.Event.ID, teamID);
						internalRefs.Update_TeamStats_CurrentEvent.Add(teamStats_CurrentEvent.CompositeKey, teamStats_CurrentEvent);
					}

					//if the event is not already included in the season stats, populate season stats
					if (!teamStats_Season.EventsIncluded.Contains(internalRefs.Event.ID))
					{
						//find all matches this team has participated in
						List<RE.Objects.MatchObj> matchesForTeam = [.. matchesAtDivision.Where(m => m.Alliances.Any(a => a.Teams.Any(t => t.Team.Id == teamID)))];
						//populate the TeamStats_Season object with the match data
						foreach (RE.Objects.MatchObj match in matchesForTeam)
						{
							Helpers.TeamStats_Denorm.AddREMatchToDenormData(teamID, teamStats_Season.Stats.DenormData, match);
						}
						RE.Objects.Ranking rankingForTeam = rankingsAtDivision.FirstOrDefault(r => r.Team.Id == teamID);
						Helpers.TeamStats_Season.AddInfoToSeasonEventStats(teamStats_Season, internalRefs.Event.ID, internalRefs.Event.Name, divisionID, matchesForTeam, rankingForTeam);
					}
				}
			}
			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.V5RC.EventDivision.ProcessDivision: END - Division {divisionID}");
		}
	}
}
