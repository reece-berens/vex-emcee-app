using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class QualiMatchStats : MatchStats
	{
		public QualiMatchStats() : base()
		{
			WPTotal = 0;
			APTotal = 0;
			SPTotal = 0;
			WPAvg = 0;
			APAvg = 0;
			SPAvg = 0;
		}

		public QualiMatchStats(QualiMatchStats other) : base(other)
		{
			WPTotal = other.WPTotal;
			APTotal = other.APTotal;
			SPTotal = other.SPTotal;
			WPAvg = other.WPAvg;
			APAvg = other.APAvg;
			SPAvg = other.SPAvg;
		}

		[JsonPropertyName("WT")]
		public int WPTotal { get; set; }
		[JsonPropertyName("AT")]
		public int APTotal { get; set; }
		[JsonPropertyName("ST")]
		public int SPTotal { get; set; }
		[JsonPropertyName("WA")]
		public double WPAvg { get; set; }
		[JsonPropertyName("AA")]
		public double APAvg { get; set; }
		[JsonPropertyName("SA")]
		public double SPAvg { get; set; }
		[JsonPropertyName("HS")]
		public int HighScore { get; set; }
	}
}
