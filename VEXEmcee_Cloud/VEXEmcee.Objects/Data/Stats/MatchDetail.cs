using System.Text.Json.Serialization;
using RE.Objects;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.Objects.Data.Stats
{
	public class MatchDetail
	{
		[JsonPropertyName("R")]
		public MatchRoundType RoundEnum { get; set; }
		[JsonPropertyName("I")]
		public int Instance { get; set; }
		[JsonPropertyName("MN")]
		public int MatchNumber { get; set; }
		[JsonPropertyName("N")]
		public string Name { get; set; }
		[JsonPropertyName("A")]
		public List<Alliance> Alliances { get; set; }
		[JsonPropertyName("O")]
		public string Outcome_denorm { get; set; }
		[JsonPropertyName("D")]
		public int DivisionID { get; set; }
	}
}
