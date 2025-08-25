using VEXEmcee.Objects.Data.Stats;
using RE.Objects;

namespace VEXEmcee.Logic.InternalLogic.Helpers
{
	internal class TeamStats_Season
	{
		/// <summary>
		/// Creates a new instance of <see cref="DB.Dynamo.Definitions.TeamStats_Season"/> initialized with the specified
		/// season and team identifiers.
		/// </summary>
		/// <param name="seasonID">The identifier of the season to associate with the team statistics.</param>
		/// <param name="teamID">The identifier of the team to associate with the season statistics.</param>
		/// <returns>A new <see cref="DB.Dynamo.Definitions.TeamStats_Season"/> object with default statistics and no events included.</returns>
		internal static DB.Dynamo.Definitions.TeamStats_Season CreateNew(int seasonID, int teamID)
		{
			DB.Dynamo.Definitions.TeamStats_Season newStats = new()
			{
				TeamID = teamID,
				SeasonID = seasonID,
				Stats = new Objects.Data.Stats.TeamStatsSeason(),
				EventsIncluded = []
			};

			return newStats;
		}

		internal static void AddInfoToSeasonEventStats(DB.Dynamo.Definitions.TeamStats_Season teamStats_Season, int eventID, string eventName, int divisionID, 
			List<RE.Objects.MatchObj> matches, RE.Objects.Ranking ranking
		)
		{
			if (teamStats_Season != null && !teamStats_Season.EventsIncluded.Contains(eventID))
			{
				EventStats thisEventStats = teamStats_Season.Stats.Events.FirstOrDefault(x => x.EventID == ranking.Event.Id);
				if (thisEventStats == null)
				{
					thisEventStats = new()
					{
						EventID = eventID,
						EventName_denorm = eventName,
						QualiMatches = [],
						ElimMatches = [],
						ElimPartners = []
					};
					teamStats_Season.Stats.Events.Add(thisEventStats);
				}
				if (ranking != null)
				{
					//assume that this is for quali stats, create new object as there should only be one per event
					thisEventStats.QualiStats = new()
					{
						Rank = ranking.Rank,
						Win = ranking.Wins,
						Loss = ranking.Losses,
						Tie = ranking.Ties,
						WP = ranking.WP,
						AP = ranking.AP,
						SP = ranking.SP,
						HighScore = ranking.High_Score,
						AveragePPM = ranking.Average_Points,
						TotalPoints = ranking.Total_Points,
					};
				}
				if (matches != null)
				{
					bool loadedElimPartners = false;
					foreach (MatchObj curMatch in matches)
					{
						if (Helpers.Match.IsQualiMatch(curMatch))
						{
							QualiMatchDetail qualiDetail = new()
							{
								RoundEnum = curMatch.Round,
								Instance = curMatch.Instance,
								MatchNumber = curMatch.MatchNumber,
								DivisionID = divisionID,
								Name = curMatch.Name,
								Alliances = [.. curMatch.Alliances.Select(a => new Objects.Data.Stats.Alliance()
								{
									Color = a.Color,
									Score = a.Score,
									Teams = [.. a.Teams.Select(t => new TeamRef()
									{
										ID = t.Team.Id,
										Number = t.Team.Name
									})],
								})],
							};
							RE.Objects.Alliance thisAlliance = curMatch.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.Team.Id == teamStats_Season.TeamID));
							RE.Objects.Alliance otherAlliance = curMatch.Alliances.FirstOrDefault(a => a != thisAlliance);
							if (thisAlliance != null && otherAlliance != null)
							{
								qualiDetail.AllianceColor_denorm = thisAlliance.Color;
								qualiDetail.AllianceScore_denorm = thisAlliance.Score;
								qualiDetail.Outcome_denorm = thisAlliance.Score == otherAlliance.Score ? "Tie" : (thisAlliance.Score < otherAlliance.Score ? "Loss" : "Win");
							}
							thisEventStats.QualiMatches.Add(qualiDetail);
						}
						else if (Helpers.Match.IsElimMatch(curMatch))
						{
							ElimMatchDetail elimDetail = new()
							{
								RoundEnum = curMatch.Round,
								Instance = curMatch.Instance,
								MatchNumber = curMatch.MatchNumber,
								DivisionID = divisionID,
								Name = curMatch.Name,
								Alliances = [.. curMatch.Alliances.Select(a => new Objects.Data.Stats.Alliance()
								{
									Color = a.Color,
									Score = a.Score,
									Teams = [.. a.Teams.Select(t => new TeamRef()
									{
										ID = t.Team.Id,
										Number = t.Team.Name
									})],
								})],
							};
							//add elim partners
							RE.Objects.Alliance thisAlliance = curMatch.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.Team.Id == teamStats_Season.TeamID));
							RE.Objects.Alliance otherAlliance = curMatch.Alliances.FirstOrDefault(a => a != thisAlliance);
							if (!loadedElimPartners && thisAlliance != null)
							{
								foreach (RE.Objects.AllianceTeam team in thisAlliance.Teams)
								{
									if (team.Team.Id != teamStats_Season.TeamID)
									{
										thisEventStats.ElimPartners.Add(new()
										{
											ID = team.Team.Id,
											Number = team.Team.Name
										});
									}
								}
								loadedElimPartners = true;
							}
							if (thisAlliance != null && otherAlliance != null)
							{
								elimDetail.TeamAlliance_denorm = thisAlliance.Color;
								elimDetail.TeamScore_denorm = thisAlliance.Score;
								elimDetail.Outcome_denorm = thisAlliance.Score == otherAlliance.Score ? "Tie" : (thisAlliance.Score < otherAlliance.Score ? "Loss" : "Win");
							}
							thisEventStats.ElimMatches.Add(elimDetail);
						}
					}
				}
			}
		}
	}
}
