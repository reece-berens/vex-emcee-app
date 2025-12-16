using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VEXEmcee.Logic.InternalLogic.Helpers
{
	internal static class Award
	{
		internal static bool IsCompetitionAward(Objects.Data.Stats.Award award)
		{
			ArgumentNullException.ThrowIfNull(award);
			List<string> partialCompetitionAwardNames = [
				"Tournament Champion",
				"Tournament Finalist",
				"Robot Skills Champion"
			];
			return partialCompetitionAwardNames.Any(x => award.AwardName.Contains(x, StringComparison.OrdinalIgnoreCase));
		}

		internal static bool IsJudgedAward(Objects.Data.Stats.Award award)
		{
			ArgumentNullException.ThrowIfNull(award);
			List<string> partialJudgedAwardNames = [
				"Excellence Award",
				"Design Award",
				"Judges Award",
				"Innovate Award",
				"Think Award",
				"Amaze Award",
				"Build Award",
				"Create Award",
				"Inspire Award",
				"Sportsmanship Award",
				"Energy Award"
			];
			return partialJudgedAwardNames.Any(x => award.AwardName.Contains(x, StringComparison.OrdinalIgnoreCase));
		}
	}
}
