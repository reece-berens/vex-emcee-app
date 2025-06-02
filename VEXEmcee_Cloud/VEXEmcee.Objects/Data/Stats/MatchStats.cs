using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class MatchStats
	{
		[JsonPropertyName("MC")]
		public int MatchCount { get; set; }
		[JsonPropertyName("PFT")]
		public int PointsForTotal { get; set; }
		[JsonPropertyName("PAT")]
		public int PointsAgainstTotal { get; set; }
		[JsonPropertyName("PFA")]
		public double PointsForAvg { get; set; }
		[JsonPropertyName("PAA")]
		public double PointsAgainstAvg { get; set; }
		[JsonPropertyName("WP")]
		public double WinPercentage { get; set; }
		[JsonPropertyName("W")]
		public int Win { get; set; }
		[JsonPropertyName("L")]
		public int Loss { get; set; }
		[JsonPropertyName("T")]
		public int Tie { get; set; }
	}
}
