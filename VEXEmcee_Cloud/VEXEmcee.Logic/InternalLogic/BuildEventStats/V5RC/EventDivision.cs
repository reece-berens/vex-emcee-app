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
					if (!teamsInDivision.Contains(ranking?.Team?.Id ?? 0))
					{
						teamsInDivision.Add(ranking?.Team?.Id ?? 0);
						if (!internalRefs.Event.Teams_denorm.Contains(ranking?.Team?.Id ?? 0))
						{
							internalRefs.Event.Teams_denorm.Add(ranking?.Team?.Id ?? 0);
						}
					}
				}
				foreach (RE.Objects.MatchObj match in matchesAtDivision)
				{
					foreach (RE.Objects.Alliance team in match.Alliances)
					{
						foreach (RE.Objects.AllianceTeam teamObj in team.Teams)
						{
							if (!teamsInDivision.Contains(teamObj?.Team?.Id ?? 0))
							{
								teamsInDivision.Add(teamObj?.Team?.Id ?? 0);
								if (!internalRefs.Event.Teams_denorm.Contains(teamObj?.Team?.Id ?? 0))
								{
									internalRefs.Event.Teams_denorm.Add(teamObj?.Team?.Id ?? 0);
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

		internal static async Task UpdateMatches(DB.Dynamo.Definitions.Event thisEvent, int divisionID, List<TeamStats_Season> seasonStats, List<TeamStats_CurrentEvent> currentEventStats,
			List<LiveMatch> currentEventMatches, List<LiveMatch> matchesToUpdate
		) 
		{
			Console.WriteLine(divisionID);
			List<RE.Objects.MatchObj> matchesAtDivision = await Helpers.REAPI.Event.GetMatchesAtEventDivision(thisEvent.ID, divisionID);
			Dictionary<int, TeamStats_CurrentEvent> currentEventStatsDict = currentEventStats.ToDictionary(x => x.TeamID, x => x);
			Dictionary<int, TeamStats_Season> seasonStatsDict = seasonStats.ToDictionary(x => x.TeamID, x => x);

			if (!thisEvent.DivisionTeams.ContainsKey(divisionID))
			{
				thisEvent.DivisionTeams[divisionID] = [];
			}

			//add stats for each match into the current event stats for each team that participated in a match
			foreach (RE.Objects.MatchObj match in matchesAtDivision)
			{
				//find each alliance's score to determine who won/lost/tied
				RE.Objects.Alliance redAlliance = match.Alliances.FirstOrDefault(a => a.Color?.Equals("red", StringComparison.InvariantCultureIgnoreCase) ?? false);
				RE.Objects.Alliance blueAlliance = match.Alliances.FirstOrDefault(a => a.Color?.Equals("blue", StringComparison.InvariantCultureIgnoreCase) ?? false);
				//for each team in the match, update their current event stats
				if (redAlliance != null && blueAlliance != null && (redAlliance.Score != 0 || blueAlliance.Score != 0 || match.Scored))
				{
					List<RE.Objects.Alliance> curAllianceList = [redAlliance, blueAlliance];
					foreach (RE.Objects.Alliance alliance in curAllianceList)
					{
						foreach (RE.Objects.AllianceTeam team in alliance.Teams)
						{
							if (!thisEvent.DivisionTeams[divisionID].Contains(team?.Team?.Id ?? 0))
							{
								//if the team is not in the division teams, add it (this would be if a division is added mid-way through an event)
								thisEvent.DivisionTeams[divisionID].Add(team?.Team?.Id ?? 0);
							}
							if (currentEventStatsDict.TryGetValue(team?.Team?.Id ?? 0, out TeamStats_CurrentEvent teamStats_CurrentEvent))
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
												.Select(x => new TeamRef() { ID = x?.Team?.Id ?? 0, Number = x.Team.Name })
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

					//update any LiveMatch objects as needed
					LiveMatch liveMatch = currentEventMatches.FirstOrDefault(x => x.ID == match.Id);
					if (liveMatch == null)
					{
						//the match has not been created yet, create it and add to current and update lists
						liveMatch = new()
						{
							ID = match.Id,
							EventID = thisEvent.ID,
							DivisionID = divisionID,
							Instance = match.Instance,
							MatchNumber = match.MatchNumber,
							Round = match.Round,
							ScoreFinalized = match.Scored,
							Name = match.Name,
							Field = match.Field,
							BlueScore = blueAlliance.Score,
							RedScore = redAlliance.Score,
							MatchWinner = blueAlliance.Score > redAlliance.Score ? "Blue" : (redAlliance.Score > blueAlliance.Score ? "Red" : "Tie"),
							Alliances =
							[
								new LiveMatchAlliance()
								{
									Color = "Red",
									Score = redAlliance.Score,
									Teams = [..redAlliance.Teams.Select(t => new LiveMatchAllianceTeam() { ID = t?.Team?.Id ?? 0, Number = t.Team.Name })]
								},
								new LiveMatchAlliance()
								{
									Color = "Blue",
									Score = blueAlliance.Score,
									Teams = [..blueAlliance.Teams.Select(t => new LiveMatchAllianceTeam() { ID = t?.Team?.Id ?? 0, Number = t.Team.Name })]
								}
							],
						};
						currentEventMatches.Add(liveMatch);
						matchesToUpdate.Add(liveMatch);
					}
					else
					{
						//see if any of the data in the match has changed, update if so
						bool matchUpdated = false;
						if (liveMatch.Instance != match.Instance)
						{
							liveMatch.Instance = match.Instance;
							matchUpdated = true;
						}
						if (liveMatch.MatchNumber != match.MatchNumber)
						{
							liveMatch.MatchNumber = match.MatchNumber;
							matchUpdated = true;
						}
						if (liveMatch.Round != match.Round)
						{
							liveMatch.Round = match.Round;
							matchUpdated = true;
						}
						if (liveMatch.ScoreFinalized != match.Scored)
						{
							liveMatch.ScoreFinalized = match.Scored;
							matchUpdated = true;
						}
						if (liveMatch.Name != match.Name)
						{
							liveMatch.Name = match.Name;
							matchUpdated = true;
						}
						if (liveMatch.Field != match.Field)
						{
							liveMatch.Field = match.Field;
							matchUpdated = true;
						}
						if (liveMatch.BlueScore != blueAlliance.Score)
						{
							liveMatch.BlueScore = blueAlliance.Score;
							liveMatch.MatchWinner = blueAlliance.Score > redAlliance.Score ? "Blue" : (redAlliance.Score > blueAlliance.Score ? "Red" : "Tie");
							matchUpdated = true;
						}
						if (liveMatch.RedScore != redAlliance.Score)
						{
							liveMatch.RedScore = redAlliance.Score;
							liveMatch.MatchWinner = blueAlliance.Score > redAlliance.Score ? "Blue" : (redAlliance.Score > blueAlliance.Score ? "Red" : "Tie");
							matchUpdated = true;
						}
						//check alliances for different teams
						matchUpdated |= UpdateLiveMatchTeamsFromMatchObj(match, liveMatch);

						if (matchUpdated)
						{
							matchesToUpdate.Add(liveMatch);
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
					teamStats_CurrentEvent = Helpers.TeamStats_CurrentEvent.CreateNew(thisEvent.ID, ranking?.Team?.Id ?? 0);
					currentEventStats.Add(teamStats_CurrentEvent);
				}
				if (teamStats_Season == null)
				{
					teamStats_Season = Helpers.TeamStats_Season.CreateNew(thisEvent.ID, ranking?.Team?.Id ?? 0);
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

		private static bool UpdateLiveMatchTeamsFromMatchObj(RE.Objects.MatchObj reMatch, LiveMatch dbMatch)
		{
			bool updated = false;

			// Build a dictionary for quick lookup by alliance color (case-insensitive)
			var reMatchAlliances = reMatch.Alliances.ToDictionary(
				a => a.Color?.ToLowerInvariant(),
				a => a
			);
			var dbMatchAlliances = dbMatch.Alliances.ToDictionary(
				a => a.Color?.ToLowerInvariant(),
				a => a
			);

			foreach (var color in reMatchAlliances.Keys)
			{
				var reAlliance = reMatchAlliances[color];
				if (dbMatchAlliances.TryGetValue(color, out var liveAlliance))
				{
					// Get team IDs from both sources
					var matchTeamIds = reAlliance.Teams.Select(t => t.Team.Id).OrderBy(id => id).Select(id => id.Value).ToList();
					var liveTeamIds = liveAlliance.Teams.Select(t => t.ID).OrderBy(id => id).ToList();

					if (!matchTeamIds.SequenceEqual(liveTeamIds))
					{
						// Teams differ, update LiveMatchAlliance.Teams
						liveAlliance.Teams = [.. reAlliance.Teams
							.Select(t => new LiveMatchAllianceTeam
							{
								ID = t ?.Team ?.Id ?? 0,
								Number = t.Team.Name
							})];
						updated = true;
					}
				}
				else
				{
					// Alliance color missing in LiveMatch, add it
					var newAlliance = new LiveMatchAlliance
					{
						Color = reAlliance.Color,
						Score = reAlliance.Score,
						Teams = [.. reAlliance.Teams
							.Select(t => new LiveMatchAllianceTeam
							{
								ID = t ?.Team ?.Id ?? 0,
								Number = t.Team.Name
							})]
					};
					dbMatch.Alliances.Add(newAlliance);
					updated = true;
				}
			}

			// Remove alliances from LiveMatch that are not present in MatchObj
			var matchColors = reMatchAlliances.Keys.ToHashSet();
			var toRemove = dbMatch.Alliances.Where(a => !matchColors.Contains(a.Color?.ToLowerInvariant())).ToList();
			if (toRemove.Count > 0)
			{
				foreach (var alliance in toRemove)
					dbMatch.Alliances.Remove(alliance);
				updated = true;
			}

			return updated;
		}
	}
}
