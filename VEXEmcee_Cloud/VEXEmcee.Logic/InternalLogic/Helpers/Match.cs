using RE.Objects;

namespace VEXEmcee.Logic.InternalLogic.Helpers
{
	internal class Match
	{
		internal static bool IsElimMatch(MatchObj match)
		{
			return match != null && 
				(
					match.Round == MatchRoundType.Round128 || match.Round == MatchRoundType.Round64 || match.Round == MatchRoundType.Round32 ||
					match.Round == MatchRoundType.Round16 || match.Round == MatchRoundType.QuarterFinal || match.Round == MatchRoundType.SemiFinal || match.Round == MatchRoundType.Final
				);
		}
		internal static bool IsQualiMatch(MatchObj match)
		{
			return match != null && match.Round == MatchRoundType.Qualification;
		}
	}
}
