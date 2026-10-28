using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using VEXEmcee.Objects.Data.ClientApp.MatchInfo;
using VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.Data.ClientApp.Display;

namespace VEXEmcee.Logic.InternalLogic.MatchInfo
{
	internal class V5RC
	{
		/// <summary>
		/// Retrieves info for the specified match and populates the response object in the V5RC format.
		/// </summary>
		/// <remarks>This method fetches match data associated with the specified event and updates the response
		/// object. The match data may be cached or retrieved from an external API, depending on the timing of the last
		/// request. Ensure that the <paramref name="request"/> and <paramref name="response"/> objects are properly
		/// initialized before calling this method.</remarks>
		/// <param name="request">The request object containing parameters for retrieving match data.</param>
		/// <param name="response">The response object to be populated with the match info.</param>
		/// <param name="thisEvent">The event for which match data is being retrieved.</param>
		internal static async Task GetMatchInfo(GetMatchInfoRequest request, GetMatchInfoResponse response, Definitions.Event thisEvent)
		{
			//TODO - fill out the response information based on match data pulled from RE API and stored in LiveMatches table
			//possibly have some sort of "previous API request" time that we can use to determine if we need to pull new data
			//ex. don't pull new data from RE if the last request was made within the last minute or two
			//that will probably need to be stored based on the event ID so that it can be tracked per event that's happening...
			//probably store in the database or some memory cache so that it persists between different lambda context sessions

			//get the match from LiveMatches
			Definitions.LiveMatch thisMatch = await Accessors.LiveMatch.GetByMatchID(request.MatchKey, request.SessionEventID.Value);
			if (thisMatch == null)
			{
				response.ErrorMessage = "The specified match does not exist.";
				response.Success = false;
				response.StatusCode = System.Net.HttpStatusCode.BadRequest;
			}
			else
			{
				Objects.Data.ClientApp.MatchInfo.V5RC matchInfo = new()
				{
					MatchInstance = thisMatch.Instance,
					MatchNumber = thisMatch.MatchNumber,
					MatchRound = (int)thisMatch.Round,
					Scored = thisMatch.RedScore > 0 || thisMatch.BlueScore > 0 || thisMatch.ScoreFinalized,
					BlueWin = thisMatch.MatchWinner.Equals("blue", StringComparison.CurrentCultureIgnoreCase),
					RedWin = thisMatch.MatchWinner.Equals("red", StringComparison.CurrentCultureIgnoreCase),
					Tie = thisMatch.MatchWinner.Equals("tie", StringComparison.CurrentCultureIgnoreCase),
				};
				matchInfo.Blue = new()
				{
					Score = thisMatch.BlueScore,
					Teams = thisMatch.Alliances
						.FirstOrDefault(a => a.Color.Equals("blue", StringComparison.CurrentCultureIgnoreCase))
						?.Teams
						.Select(t => new V5RC_Team()
							{
								ID = t.ID,
								TeamNumber = t.Number,
								Stats = []
							}
						)
						.ToList() ?? []
				};
				matchInfo.Red = new()
				{
					Score = thisMatch.RedScore,
					Teams = thisMatch.Alliances
						.FirstOrDefault(a => a.Color.Equals("red", StringComparison.CurrentCultureIgnoreCase))
						?.Teams
						.Select(t => new V5RC_Team()
							{
								ID = t.ID,
								TeamNumber = t.Number,
								Stats = []
							}
						)
						.ToList() ?? []
				};
				List<int> teamIDList = [
					..matchInfo.Blue.Teams.Select(t => t.ID),
					..matchInfo.Red.Teams.Select(t => t.ID)
				];
				List<Definitions.Team> teamData = await Accessors.Team.GetByTeamIDList(teamIDList);
				if (teamData != null)
				{
					foreach (V5RC_Team team in matchInfo.Blue.Teams)
					{
						Definitions.Team teamInfo = teamData.FirstOrDefault(t => t.ID == team.ID);
						if (teamInfo != null)
						{
							team.TeamLocator = $"{teamInfo.Organization} - {teamInfo.CityState_denorm}";
							team.TeamName = teamInfo.TeamName;
						}
					}
					foreach (V5RC_Team team in matchInfo.Red.Teams)
					{
						Definitions.Team teamInfo = teamData.FirstOrDefault(t => t.ID == team.ID);
						if (teamInfo != null)
						{
							team.TeamLocator = $"{teamInfo.Organization} - {teamInfo.CityState_denorm}";
							team.TeamName = teamInfo.TeamName;
						}
					}
				}

				//load the stats for each team in this match
				Dictionary<int, TeamStats_CurrentEvent> currentEventStatsDict = [];
				Dictionary<int, TeamStats_Season> seasonStatsDict = [];
				var teamEventStatsTasks = teamData
					.Select(team => Accessors.TeamStats_CurrentEvent.GetByCompositeKey(thisEvent.ID, team.ID)
						.ContinueWith(task => new { TeamID = team.ID, Stats = task.Result }))
					.ToList();
				var teamEventStatsResults = await Task.WhenAll(teamEventStatsTasks);
				foreach (var result in teamEventStatsResults)
				{
					if (result.Stats != null)
					{
						currentEventStatsDict[result.TeamID] = result.Stats;
					}
				}
				var teamSeasonStatsTasks = teamData
					.Select(team => Accessors.TeamStats_Season.GetByCompositeKey(thisEvent.SeasonID, team.ID)
						.ContinueWith(task => new { TeamID = team.ID, Stats = task.Result }))
					.ToList();
				var teamSeasonStatsResults = await Task.WhenAll(teamSeasonStatsTasks);
				foreach (var result in teamSeasonStatsResults)
				{
					if (result.Stats != null)
					{
						seasonStatsDict[result.TeamID] = result.Stats;
					}
				}

                List<LiveMatch> matchesThisTournament = await Accessors.LiveMatch.GetByEventID(thisEvent.ID);

                PopulateStatsForTeams(
					matchInfo.Blue.Teams.ElementAtOrDefault(0),
					matchInfo.Blue.Teams.ElementAtOrDefault(1),
					matchInfo.Red.Teams.ElementAtOrDefault(0),
					matchInfo.Red.Teams.ElementAtOrDefault(1),
					currentEventStatsDict,
					seasonStatsDict,
					matchesThisTournament
				);

				MatchList.V5RC.SortMatches(matchesThisTournament);
				int indexOfCurrent = matchesThisTournament.FindIndex(m => m.CompositeKey == thisMatch.CompositeKey);
				if (indexOfCurrent != -1)
				{
					if (indexOfCurrent > 0)
					{
						Definitions.LiveMatch previousMatch = matchesThisTournament[indexOfCurrent - 1];
						matchInfo.PreviousMatchKey = previousMatch.CompositeKey;
					}
					if (indexOfCurrent < matchesThisTournament.Count - 1)
					{
						Definitions.LiveMatch nextMatch = matchesThisTournament[indexOfCurrent + 1];
						matchInfo.NextMatchKey = nextMatch.CompositeKey;
                    }
                }

                response.MatchInfo = matchInfo;
			}
		}

		internal static void PopulateStatsForTeams(V5RC_Team blue1, V5RC_Team blue2, V5RC_Team red1, V5RC_Team red2, 
			Dictionary<int, TeamStats_CurrentEvent> currentEventStats, Dictionary<int, TeamStats_Season> seasonStats,
			List<LiveMatch> matchesThisTournament
		)
		{
			TeamStats_CurrentEvent blue1Current = currentEventStats[blue1.ID];
			TeamStats_CurrentEvent blue2Current = currentEventStats[blue2.ID];
			TeamStats_CurrentEvent red1Current = currentEventStats[red1.ID];
			TeamStats_CurrentEvent red2Current = currentEventStats[red2.ID];
			TeamStats_Season blue1Season = seasonStats[blue1.ID];
			TeamStats_Season blue2Season = seasonStats[blue2.ID];
			TeamStats_Season red1Season = seasonStats[red1.ID];
			TeamStats_Season red2Season = seasonStats[red2.ID];

            SectionHeader blue1SHSeason = new()
			{
				Name = "Season Stats Entering This Tournament",
				Order = 1,
				Display = []
			};
			blue1SHSeason.Display.Add(new()
			{
				SectionLabel = "WLT",
				SectionData = [
					$"All Matches: {blue1Season?.Stats.DenormData?.AllMatches?.Win ?? 0}-{blue1Season?.Stats.DenormData?.AllMatches?.Loss ?? 0}-{blue1Season?.Stats.DenormData?.AllMatches?.Tie ?? 0} - {blue1Season?.Stats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct.",
					$"Qualification Matches: {blue1Season?.Stats.DenormData?.QualiMatches?.Win ?? 0}-{blue1Season?.Stats.DenormData?.QualiMatches?.Loss ?? 0}-{blue1Season?.Stats.DenormData?.QualiMatches?.Tie ?? 0} - {blue1Season?.Stats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct.",
					$"Elimination Matches: {blue1Season?.Stats.DenormData?.ElimMatches?.Win ?? 0}-{blue1Season?.Stats.DenormData?.ElimMatches?.Loss ?? 0}-{blue1Season?.Stats.DenormData?.ElimMatches?.Tie ?? 0} - {blue1Season?.Stats.DenormData?.ElimMatches?.WinPercentage:P1} Win Pct."
				],
			});
			if (blue1Season.Stats.Awards?.Count > 0)
			{
				blue1SHSeason.Display.Add(new()
				{
					SectionLabel = "Awards",
					SectionData = [
						$"{blue1Season.Stats.Awards.Count} Total Awards",
						$"{blue1Season.Stats.Awards.Count(Helpers.Award.IsJudgedAward)} Judged Awards"
					]
				});
			}
			blue1.Stats.Add(blue1SHSeason);

			SectionHeader blue2SHSeason = new()
			{
				Name = "Season Stats Entering This Tournament",
				Order = 1,
				Display = []
			};
			blue2SHSeason.Display.Add(new()
			{
				SectionLabel = "WLT",
				SectionData = [
					$"All Matches: {blue2Season?.Stats.DenormData?.AllMatches?.Win ?? 0}-{blue2Season?.Stats.DenormData?.AllMatches?.Loss ?? 0}-{blue2Season?.Stats.DenormData?.AllMatches?.Tie ?? 0} - {blue2Season?.Stats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct.",
					$"Qualification Matches: {blue2Season?.Stats.DenormData?.QualiMatches?.Win ?? 0}-{blue2Season?.Stats.DenormData?.QualiMatches?.Loss ?? 0}-{blue2Season?.Stats.DenormData?.QualiMatches?.Tie ?? 0} - {blue2Season?.Stats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct.",
					$"Elimination Matches: {blue2Season?.Stats.DenormData?.ElimMatches?.Win ?? 0}-{blue2Season?.Stats.DenormData?.ElimMatches?.Loss ?? 0}-{blue2Season?.Stats.DenormData?.ElimMatches?.Tie ?? 0} - {blue2Season?.Stats.DenormData?.ElimMatches?.WinPercentage:P1} Win Pct."
				],
			});
			if (blue2Season.Stats.Awards?.Count > 0)
			{
				blue2SHSeason.Display.Add(new()
				{
					SectionLabel = "Awards",
					SectionData = [
						$"{blue2Season.Stats.Awards.Count} Total Awards",
						$"{blue2Season.Stats.Awards.Count(Helpers.Award.IsJudgedAward)} Judged Awards"
					]
				});
			}
			blue2.Stats.Add(blue2SHSeason);

			SectionHeader red1SHSeason = new()
			{
				Name = "Season Stats Entering This Tournament",
				Order = 1,
				Display = []
			};
			red1SHSeason.Display.Add(new()
			{
				SectionLabel = "WLT",
				SectionData = [
					$"All Matches: {red1Season?.Stats.DenormData?.AllMatches?.Win ?? 0}-{red1Season?.Stats.DenormData?.AllMatches?.Loss ?? 0}-{red1Season?.Stats.DenormData?.AllMatches?.Tie ?? 0} - {red1Season?.Stats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct.",
					$"Qualification Matches: {red1Season?.Stats.DenormData?.QualiMatches?.Win ?? 0}-{red1Season?.Stats.DenormData?.QualiMatches?.Loss ?? 0}-{red1Season?.Stats.DenormData?.QualiMatches?.Tie ?? 0} - {red1Season?.Stats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct.",
					$"Elimination Matches: {red1Season?.Stats.DenormData?.ElimMatches?.Win ?? 0}-{red1Season?.Stats.DenormData?.ElimMatches?.Loss ?? 0}-{red1Season?.Stats.DenormData?.ElimMatches?.Tie ?? 0} - {red1Season?.Stats.DenormData?.ElimMatches?.WinPercentage:P1} Win Pct."
				],
			});
			if (red1Season.Stats.Awards?.Count > 0)
			{
				red1SHSeason.Display.Add(new()
				{
					SectionLabel = "Awards",
					SectionData = [
						$"{red1Season.Stats.Awards.Count} Total Awards",
						$"{red1Season.Stats.Awards.Count(Helpers.Award.IsJudgedAward)} Judged Awards"
					]
				});
			}
			red1.Stats.Add(red1SHSeason);

			SectionHeader red2SHSeason = new()
			{
				Name = "Season Stats Entering This Tournament",
				Order = 1,
				Display = []
			};
			red2SHSeason.Display.Add(new()
			{
				SectionLabel = "WLT",
				SectionData = [
					$"All Matches: {red2Season?.Stats.DenormData?.AllMatches?.Win ?? 0}-{red2Season?.Stats.DenormData?.AllMatches?.Loss ?? 0}-{red2Season?.Stats.DenormData?.AllMatches?.Tie ?? 0} - {red2Season?.Stats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct.",
					$"Qualification Matches: {red2Season?.Stats.DenormData?.QualiMatches?.Win ?? 0}-{red2Season?.Stats.DenormData?.QualiMatches?.Loss ?? 0}-{red2Season?.Stats.DenormData?.QualiMatches?.Tie ?? 0} - {red2Season?.Stats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct.",
					$"Elimination Matches: {red2Season?.Stats.DenormData?.ElimMatches?.Win ?? 0}-{red2Season?.Stats.DenormData?.ElimMatches?.Loss ?? 0}-{red2Season?.Stats.DenormData?.ElimMatches?.Tie ?? 0} - {red2Season?.Stats.DenormData?.ElimMatches?.WinPercentage:P1} Win Pct."
				],
			});
			if (red2Season.Stats.Awards?.Count > 0)
			{
				red2SHSeason.Display.Add(new()
				{
					SectionLabel = "Awards",
					SectionData = [
						$"{red2Season.Stats.Awards.Count} Total Awards",
						$"{red2Season.Stats.Awards.Count(Helpers.Award.IsJudgedAward)} Judged Awards"
					]
				});
			}
			red2.Stats.Add(red2SHSeason);

            SectionHeader blue1SHThisEvent = new()
            {
                Name = "This Event",
                Order = 2,
                Display = []
            };
            blue1SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Overall WLT (Qualification + Elim.)",
                SectionData = [
                    $"{blue1Current?.EventStats.DenormData?.AllMatches?.Win ?? 0}-{blue1Current?.EventStats.DenormData?.AllMatches?.Loss ?? 0}-{blue1Current?.EventStats.DenormData?.AllMatches?.Tie ?? 0}",
                    $"{blue1Current?.EventStats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct."
                ],
            });
            blue1SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Qualification WLT",
                SectionData = [
                    $"{blue1Current?.EventStats.DenormData?.QualiMatches?.Win ?? 0}-{blue1Current?.EventStats.DenormData?.QualiMatches?.Loss ?? 0}-{blue1Current?.EventStats.DenormData?.QualiMatches?.Tie ?? 0}",
                    $"{blue1Current?.EventStats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct."
                ],
            });
			List<LiveMatch> blue1TeamMatchesThisEvent = [..matchesThisTournament
					.Where(m =>
						m.Alliances.Any(a => a.Teams.Any(t => t.ID == blue1.ID))
						&& (m.ScoreFinalized || m.BlueScore > 0 || m.RedScore > 0)
					)
				];
			List<LiveMatchAlliance> blue1TeamAlliances = [];
			foreach (LiveMatch match in blue1TeamMatchesThisEvent)
			{
				LiveMatchAlliance alliance = match.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.ID == blue1.ID));
				if (alliance != null)
				{
					blue1TeamAlliances.Add(alliance);
				}
			}
			int blue1PointsScored = blue1TeamAlliances.Sum(a => a.Score);
			blue1SHThisEvent.Display.Add(new()
			{
				SectionLabel = "Points Scored",
				SectionData = [
					$"Total: {blue1PointsScored} points",
						$"Average per match: {(blue1TeamMatchesThisEvent.Count > 0 ? blue1PointsScored / (double)blue1TeamMatchesThisEvent.Count : 0):F1} points"
				]
			});
            blue1.Stats.Add(blue1SHThisEvent);

            SectionHeader blue2SHThisEvent = new()
            {
                Name = "This Event",
                Order = 2,
                Display = []
            };
            blue2SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Overall WLT (Qualification + Elim.)",
                SectionData = [
                    $"{blue2Current?.EventStats.DenormData?.AllMatches?.Win ?? 0}-{blue2Current?.EventStats.DenormData?.AllMatches?.Loss ?? 0}-{blue2Current?.EventStats.DenormData?.AllMatches?.Tie ?? 0}",
                    $"{blue2Current?.EventStats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct."
                ],
            });
            blue2SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Qualification WLT",
                SectionData = [
                    $"{blue2Current?.EventStats.DenormData?.QualiMatches?.Win ?? 0}-{blue2Current?.EventStats.DenormData?.QualiMatches?.Loss ?? 0}-{blue2Current?.EventStats.DenormData?.QualiMatches?.Tie ?? 0}",
                    $"{blue2Current?.EventStats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct."
                ],
            });
			List<LiveMatch> blue2TeamMatchesThisEvent = [..matchesThisTournament
					.Where(m =>
						m.Alliances.Any(a => a.Teams.Any(t => t.ID == blue2.ID))
						&& (m.ScoreFinalized || m.BlueScore > 0 || m.RedScore > 0)
					)
				];
			List<LiveMatchAlliance> blue2TeamAlliances = [];
			foreach (LiveMatch match in blue1TeamMatchesThisEvent)
			{
				LiveMatchAlliance alliance = match.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.ID == blue2.ID));
				if (alliance != null)
				{
					blue2TeamAlliances.Add(alliance);
				}
			}
			int blue2PointsScored = blue2TeamAlliances.Sum(a => a.Score);
			blue2SHThisEvent.Display.Add(new()
			{
				SectionLabel = "Points Scored",
				SectionData = [
					$"Total: {blue2PointsScored} points",
						$"Average per match: {(blue2TeamMatchesThisEvent.Count > 0 ? blue2PointsScored / (double)blue2TeamMatchesThisEvent.Count : 0):F1} points"
				]
			});
			blue2.Stats.Add(blue2SHThisEvent);

            SectionHeader red1SHThisEvent = new()
            {
                Name = "This Event",
                Order = 2,
                Display = []
            };
            red1SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Overall WLT (Qualification + Elim.)",
                SectionData = [
                    $"All Matches: {red1Current?.EventStats.DenormData?.AllMatches?.Win ?? 0}-{red1Current?.EventStats.DenormData?.AllMatches?.Loss ?? 0}-{red1Current?.EventStats.DenormData?.AllMatches?.Tie ?? 0}",
                    $"{red1Current?.EventStats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct."
                ],
            });
            red1SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Qualification WLT",
                SectionData = [
                    $"{red1Current?.EventStats.DenormData?.QualiMatches?.Win ?? 0}-{red1Current?.EventStats.DenormData?.QualiMatches?.Loss ?? 0}-{red1Current?.EventStats.DenormData?.QualiMatches?.Tie ?? 0}",
                    $"{red1Current?.EventStats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct."
                ],
            });
			List<LiveMatch> red1TeamMatchesThisEvent = [..matchesThisTournament
					.Where(m =>
						m.Alliances.Any(a => a.Teams.Any(t => t.ID == red1.ID))
						&& (m.ScoreFinalized || m.BlueScore > 0 || m.RedScore > 0)
					)
				];
			List<LiveMatchAlliance> red1TeamAlliances = [];
			foreach (LiveMatch match in red1TeamMatchesThisEvent)
			{
				LiveMatchAlliance alliance = match.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.ID == red1.ID));
				if (alliance != null)
				{
					red1TeamAlliances.Add(alliance);
				}
			}
			int red1PointsScored = red1TeamAlliances.Sum(a => a.Score);
			red1SHThisEvent.Display.Add(new()
			{
				SectionLabel = "Points Scored",
				SectionData = [
					$"Total: {red1PointsScored} points",
						$"Average per match: {(red1TeamMatchesThisEvent.Count > 0 ? red1PointsScored / (double)red1TeamMatchesThisEvent.Count : 0):F1} points"
				]
			});
			red1.Stats.Add(red1SHThisEvent);

            SectionHeader red2SHThisEvent = new()
            {
                Name = "This Event",
                Order = 2,
                Display = []
            };
            red2SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Overall WLT (Qualification + Elim.)",
                SectionData = [
                    $"{red2Current?.EventStats.DenormData?.AllMatches?.Win ?? 0}-{red2Current?.EventStats.DenormData?.AllMatches?.Loss ?? 0}-{red2Current?.EventStats.DenormData?.AllMatches?.Tie ?? 0}",
                    $"{red2Current?.EventStats.DenormData?.AllMatches?.WinPercentage:P1} Win Pct."
                ],
            });
            red2SHThisEvent.Display.Add(new()
            {
                SectionLabel = "Qualification WLT",
                SectionData = [
                    $"{red2Current?.EventStats.DenormData?.QualiMatches?.Win ?? 0}-{red2Current?.EventStats.DenormData?.QualiMatches?.Loss ?? 0}-{red2Current?.EventStats.DenormData?.QualiMatches?.Tie ?? 0}",
                    $"{red2Current?.EventStats.DenormData?.QualiMatches?.WinPercentage:P1} Win Pct."
                ],
            });
			List<LiveMatch> red2TeamMatchesThisEvent = [..matchesThisTournament
					.Where(m =>
						m.Alliances.Any(a => a.Teams.Any(t => t.ID == red2.ID))
						&& (m.ScoreFinalized || m.BlueScore > 0 || m.RedScore > 0)
					)
				];
			List<LiveMatchAlliance> red2TeamAlliances = [];
			foreach (LiveMatch match in red2TeamMatchesThisEvent)
			{
				LiveMatchAlliance alliance = match.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.ID == red2.ID));
				if (alliance != null)
				{
					red2TeamAlliances.Add(alliance);
				}
			}
			int red2PointsScored = red2TeamAlliances.Sum(a => a.Score);
			red2SHThisEvent.Display.Add(new()
			{
				SectionLabel = "Points Scored",
				SectionData = [
					$"Total: {red2PointsScored} points",
						$"Average per match: {(red2TeamMatchesThisEvent.Count > 0 ? red2PointsScored / (double)red2TeamMatchesThisEvent.Count : 0):F1} points"
				]
			});
			red2.Stats.Add(red2SHThisEvent);

            if (matchesThisTournament != null && matchesThisTournament.Count > 0)
			{
				PopulateThisEventColorStats(blue1SHThisEvent, blue1, "Blue", matchesThisTournament);
                PopulateThisEventColorStats(blue2SHThisEvent, blue2, "Blue", matchesThisTournament);
                PopulateThisEventColorStats(red1SHThisEvent, red1, "Red", matchesThisTournament);
                PopulateThisEventColorStats(red2SHThisEvent, red2, "Red", matchesThisTournament);
            }
		}

		private static void PopulateThisEventColorStats(SectionHeader sectionHeader, V5RC_Team team, string teamAllianceColor, List<LiveMatch> matchesThisTournament)
		{
			List<LiveMatch> colorMatches = [..matchesThisTournament
				.Where(m => 
					m.Alliances.Any(
						a => a.Color.Equals(teamAllianceColor, StringComparison.CurrentCultureIgnoreCase)
						&& a.Teams.Any(t => t.ID == team.ID)
					)
					&& (m.ScoreFinalized || m.BlueScore > 0 || m.RedScore > 0)
				)
			];
			int totalMatchCount = colorMatches.Count;
			int winCount = colorMatches.Count(x => x.MatchWinner.Equals(teamAllianceColor, StringComparison.CurrentCultureIgnoreCase));
			int tieCount = colorMatches.Count(x => x.MatchWinner.Equals("Tie", StringComparison.CurrentCultureIgnoreCase));
			int lossCount = colorMatches.Count(x => x.MatchWinner.Equals(teamAllianceColor.Equals("Blue", StringComparison.CurrentCultureIgnoreCase) ? "Red" : "Blue", StringComparison.CurrentCultureIgnoreCase));
			sectionHeader.Display.Add(new()
			{
				SectionLabel = $"As {teamAllianceColor} Alliance WLT",
				SectionData = [
					$"{winCount}-{lossCount}-{tieCount} - {totalMatchCount} Total",
					$"{(totalMatchCount > 0 ? (double)winCount / totalMatchCount : 0):P1} Win Pct."
				]
			});
        }
	}
}
