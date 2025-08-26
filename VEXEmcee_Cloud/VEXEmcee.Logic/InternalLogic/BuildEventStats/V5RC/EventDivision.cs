using VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.Data.Stats;

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

		internal static async Task UpdateMatches(DB.Dynamo.Definitions.Event thisEvent, int divisionID, List<TeamStats_Season> seasonStats, List<TeamStats_CurrentEvent> currentEventStats)
		{
			List<RE.Objects.MatchObj> matchesAtDivision = await Helpers.REAPI.Event.GetMatchesAtEventDivision(thisEvent.ID, divisionID);
			Dictionary<int, TeamStats_CurrentEvent> currentEventStatsDict = currentEventStats.ToDictionary(x => x.TeamID, x => x);
			Dictionary<int, TeamStats_Season> seasonStatsDict = seasonStats.ToDictionary(x => x.TeamID, x => x);

			//add stats for each match into the current event stats for each team that participated in a match
			foreach (RE.Objects.MatchObj match in matchesAtDivision)
			{
				//find each alliance's score to determine who won/lost/tied
				RE.Objects.Alliance redAlliance = match.Alliances.FirstOrDefault(a => a.Color?.Equals("red", StringComparison.InvariantCultureIgnoreCase) ?? false);
				RE.Objects.Alliance blueAlliance = match.Alliances.FirstOrDefault(a => a.Color?.Equals("blue", StringComparison.InvariantCultureIgnoreCase) ?? false);
				//for each team in the match, update their current event stats
				if (redAlliance != null && blueAlliance != null)
				{
					List<RE.Objects.Alliance> curAllianceList = [redAlliance, blueAlliance];
					foreach (RE.Objects.Alliance alliance in curAllianceList)
					{
						foreach (RE.Objects.AllianceTeam team in alliance.Teams)
						{
							if (!thisEvent.DivisionTeams[divisionID].Contains(team.Team.Id))
							{
								//if the team is not in the division teams, add it (this would be if a division is added mid-way through an event)
								thisEvent.DivisionTeams[divisionID].Add(team.Team.Id);
							}
							if (currentEventStatsDict.TryGetValue(team.Team.Id, out TeamStats_CurrentEvent teamStats_CurrentEvent))
							{
								//do the current event stats
								teamStats_CurrentEvent.EventStats.DenormData.AllMatches.MatchCount++;
								teamStats_CurrentEvent.EventStats.DenormData.AllMatches.PointsForTotal += alliance.Score;
								teamStats_CurrentEvent.EventStats.DenormData.AllMatches.PointsAgainstTotal += (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score);
								teamStats_CurrentEvent.EventStats.DenormData.AllMatches.Win += (alliance.Score > (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
								teamStats_CurrentEvent.EventStats.DenormData.AllMatches.Loss += (alliance.Score < (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
								teamStats_CurrentEvent.EventStats.DenormData.AllMatches.Tie += (alliance.Score == (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;

								if (Helpers.Match.IsQualiMatch(match))
								{
									teamStats_CurrentEvent.EventStats.DenormData.QualiMatches.MatchCount++;
									teamStats_CurrentEvent.EventStats.DenormData.QualiMatches.PointsForTotal += alliance.Score;
									teamStats_CurrentEvent.EventStats.DenormData.QualiMatches.PointsAgainstTotal += (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score);
									teamStats_CurrentEvent.EventStats.DenormData.QualiMatches.Win += (alliance.Score > (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.EventStats.DenormData.QualiMatches.Loss += (alliance.Score < (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.EventStats.DenormData.QualiMatches.Tie += (alliance.Score == (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
								}
								else if (Helpers.Match.IsElimMatch(match))
								{
									teamStats_CurrentEvent.EventStats.DenormData.ElimMatches.MatchCount++;
									teamStats_CurrentEvent.EventStats.DenormData.ElimMatches.PointsForTotal += alliance.Score;
									teamStats_CurrentEvent.EventStats.DenormData.ElimMatches.PointsAgainstTotal += (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score);
									teamStats_CurrentEvent.EventStats.DenormData.ElimMatches.Win += (alliance.Score > (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.EventStats.DenormData.ElimMatches.Loss += (alliance.Score < (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.EventStats.DenormData.ElimMatches.Tie += (alliance.Score == (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;

									if (teamStats_CurrentEvent.EventStats.ElimPartners.Count == 0)
									{
										teamStats_CurrentEvent.EventStats.ElimPartners.AddRange(
											alliance.Teams
												.Where(x => x.Team.Id != team.Team.Id)
												.Select(x => new TeamRef() { ID = x.Team.Id, Number = x.Team.Name })
										);
									}
								}

								//do the compiled stats
								teamStats_CurrentEvent.CompiledStats.DenormData.AllMatches.MatchCount++;
								teamStats_CurrentEvent.CompiledStats.DenormData.AllMatches.PointsForTotal += alliance.Score;
								teamStats_CurrentEvent.CompiledStats.DenormData.AllMatches.PointsAgainstTotal += (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score);
								teamStats_CurrentEvent.CompiledStats.DenormData.AllMatches.Win += (alliance.Score > (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
								teamStats_CurrentEvent.CompiledStats.DenormData.AllMatches.Loss += (alliance.Score < (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
								teamStats_CurrentEvent.CompiledStats.DenormData.AllMatches.Tie += (alliance.Score == (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;

								if (Helpers.Match.IsQualiMatch(match))
								{
									teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches.MatchCount++;
									teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches.PointsForTotal += alliance.Score;
									teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches.PointsAgainstTotal += (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score);
									teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches.Win += (alliance.Score > (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches.Loss += (alliance.Score < (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches.Tie += (alliance.Score == (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
								}
								else if (Helpers.Match.IsElimMatch(match))
								{
									teamStats_CurrentEvent.CompiledStats.DenormData.ElimMatches.MatchCount++;
									teamStats_CurrentEvent.CompiledStats.DenormData.ElimMatches.PointsForTotal += alliance.Score;
									teamStats_CurrentEvent.CompiledStats.DenormData.ElimMatches.PointsAgainstTotal += (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score);
									teamStats_CurrentEvent.CompiledStats.DenormData.ElimMatches.Win += (alliance.Score > (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.CompiledStats.DenormData.ElimMatches.Loss += (alliance.Score < (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
									teamStats_CurrentEvent.CompiledStats.DenormData.ElimMatches.Tie += (alliance.Score == (alliance == redAlliance ? blueAlliance.Score : redAlliance.Score)) ? 1 : 0;
								}
							}
						}
					}
				}
			}
		}

		internal static async Task UpdateRankings(DB.Dynamo.Definitions.Event thisEvent, int divisionID, List<TeamStats_Season> seasonStats, List<TeamStats_CurrentEvent> currentEventStats)
		{
			//from rankings, we just need WP/AP/SP information, get everything else from matches
			//do this since a team may be in multiple divisions throughout the tournament, but only one division (quali div) should have rankings
			List<RE.Objects.Ranking> rankingsAtDivision = await Helpers.REAPI.Event.GetRankingsAtEventDivision(thisEvent.ID, divisionID);
			foreach (RE.Objects.Ranking ranking in rankingsAtDivision)
			{
				TeamStats_Season teamStats_Season = seasonStats.FirstOrDefault(x => x.TeamID == ranking.Team.Id);
				TeamStats_CurrentEvent teamStats_CurrentEvent = currentEventStats.FirstOrDefault(x => x.TeamID == ranking.Team.Id);
				if (teamStats_CurrentEvent == null)
				{
					teamStats_CurrentEvent = Helpers.TeamStats_CurrentEvent.CreateNew(thisEvent.ID, ranking.Team.Id);
					currentEventStats.Add(teamStats_CurrentEvent);
				}
				if (teamStats_Season == null)
				{
					teamStats_Season = Helpers.TeamStats_Season.CreateNew(thisEvent.ID, ranking.Team.Id);
					seasonStats.Add(teamStats_Season);
				}
				//update the current event denorm data stats
				//only use WP/AP/SP from the ranking, all other information either comes from match data or is calculated at the very end
				QualiMatchStats qualiStatsEvent = teamStats_CurrentEvent.EventStats.DenormData.QualiMatches;
				qualiStatsEvent.WPTotal = ranking.WP;
				qualiStatsEvent.APTotal = ranking.AP;
				qualiStatsEvent.SPTotal = ranking.SP;
				teamStats_CurrentEvent.EventStats.CurrentQualiRank = ranking.Rank;

				QualiMatchStats qualiStatsSeason = teamStats_Season.Stats.DenormData.QualiMatches;
				QualiMatchStats qualiStatsCompiled = teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches;
				qualiStatsCompiled.WPTotal = qualiStatsSeason.WPTotal + qualiStatsEvent.WPTotal;
				qualiStatsCompiled.APTotal = qualiStatsSeason.APTotal + qualiStatsEvent.APTotal;
				qualiStatsCompiled.SPTotal = qualiStatsSeason.SPTotal + qualiStatsEvent.SPTotal;
			}
		}
	}
}
