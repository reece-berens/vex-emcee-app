using RE.Objects;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.Logic.InternalLogic.Helpers
{
	internal class TeamStats_Denorm
	{
		internal static void AddREMatchToDenormData(int teamID, DenormData denormData, RE.Objects.MatchObj match)
		{
			if (denormData != null && match != null)
			{
				RE.Objects.Alliance thisAlliance = match.Alliances.FirstOrDefault(a => a.Teams.Any(t => t.Team.Id == teamID));
				RE.Objects.Alliance otherAlliance = match.Alliances.FirstOrDefault(a => a != thisAlliance);
				if (thisAlliance != null && otherAlliance != null)
				{
					//All Matches
					denormData.AllMatches.MatchCount++;
					denormData.AllMatches.PointsForTotal += thisAlliance.Score;
					denormData.AllMatches.PointsAgainstTotal += otherAlliance.Score;
					denormData.AllMatches.PointsForAvg = denormData.AllMatches.PointsForTotal / (double)denormData.AllMatches.MatchCount;
					denormData.AllMatches.PointsAgainstAvg = denormData.AllMatches.PointsAgainstTotal / (double)denormData.AllMatches.MatchCount;
					if (thisAlliance.Score == otherAlliance.Score)
					{
						denormData.AllMatches.Tie++;
					}
					else if (thisAlliance.Score < otherAlliance.Score)
					{
						denormData.AllMatches.Loss++;
					}
					else
					{
						denormData.AllMatches.Win++;
					}
					denormData.AllMatches.WinPercentage = (denormData.AllMatches.Win + (0.5 * denormData.AllMatches.Tie)) / (double)denormData.AllMatches.MatchCount;

					//Quali Matches
					if (match.Round == MatchRoundType.Qualification)
					{
						denormData.QualiMatches.MatchCount++;
						denormData.QualiMatches.PointsForTotal += thisAlliance.Score;
						denormData.QualiMatches.PointsAgainstTotal += otherAlliance.Score;
						denormData.QualiMatches.PointsForAvg = denormData.QualiMatches.PointsForTotal / (double)denormData.QualiMatches.MatchCount;
						denormData.QualiMatches.PointsAgainstAvg = denormData.QualiMatches.PointsAgainstTotal / (double)denormData.QualiMatches.MatchCount;
						if (thisAlliance.Score == otherAlliance.Score)
						{
							denormData.QualiMatches.Tie++;
						}
						else if (thisAlliance.Score < otherAlliance.Score)
						{
							denormData.QualiMatches.Loss++;
						}
						else
						{
							denormData.QualiMatches.Win++;
						}
						denormData.QualiMatches.WinPercentage = (denormData.QualiMatches.Win + (0.5 * denormData.QualiMatches.Tie)) / (double)denormData.QualiMatches.MatchCount;
						//WP/AP/SP will come in rankings
					}
					//Elim Matches
					else if (match.Round == MatchRoundType.Round128 || match.Round == MatchRoundType.Round64 || match.Round == MatchRoundType.Round32 || 
						match.Round == MatchRoundType.Round16 || match.Round == MatchRoundType.QuarterFinal || match.Round == MatchRoundType.SemiFinal || match.Round == MatchRoundType.Final
					)
					{
						denormData.ElimMatches.MatchCount++;
						denormData.ElimMatches.PointsForTotal += thisAlliance.Score;
						denormData.ElimMatches.PointsAgainstTotal += otherAlliance.Score;
						denormData.ElimMatches.PointsForAvg = denormData.ElimMatches.PointsForTotal / (double)denormData.ElimMatches.MatchCount;
						denormData.ElimMatches.PointsAgainstAvg = denormData.ElimMatches.PointsAgainstTotal / (double)denormData.ElimMatches.MatchCount;
						if (thisAlliance.Score == otherAlliance.Score)
						{
							denormData.ElimMatches.Tie++;
						}
						else if (thisAlliance.Score < otherAlliance.Score)
						{
							denormData.ElimMatches.Loss++;
						}
						else
						{
							denormData.ElimMatches.Win++;
						}
						denormData.ElimMatches.WinPercentage = (denormData.ElimMatches.Win + (0.5 * denormData.ElimMatches.Tie)) / (double)denormData.ElimMatches.MatchCount;
					}
				}
			}
		}
	}
}
