using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class MatchStats
	{
		public MatchStats()
		{
			MatchCount = 0;
			PointsForTotal = 0;
			PointsAgainstTotal = 0;
			PointsForAvg = 0;
			PointsAgainstAvg = 0;
			WinPercentage = 0;
			Win = 0;
			Loss = 0;
			Tie = 0;
		}

		public MatchStats(MatchStats other)
		{
			MatchCount = other.MatchCount;
			PointsForTotal = other.PointsForTotal;
			PointsAgainstTotal = other.PointsAgainstTotal;
			PointsForAvg = other.PointsForAvg;
			PointsAgainstAvg = other.PointsAgainstAvg;
			WinPercentage = other.WinPercentage;
			Win = other.Win;
			Loss = other.Loss;
			Tie = other.Tie;
		}

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
