using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RE.Objects
{
	public static class Extensions
	{
		public static string GetLiveMatchCompositeKey(this MatchObj match)
		{
			return $"{match.Event.Id}~{match.Division.Id}~{match.Round}~{match.Instance}~{match.MatchNumber}";
		}
	}
}
