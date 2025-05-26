using RE.Objects;

namespace RE.API.Requests.Events
{
	public class DivisionMatches : DivisionIDBase
	{
		public List<MatchRoundType> Round { get; set; }
		public List<int> Instance { get; set; }
		public List<int> MatchNumber { get; set; }
	}
}
