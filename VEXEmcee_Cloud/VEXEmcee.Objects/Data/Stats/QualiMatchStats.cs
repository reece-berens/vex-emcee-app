using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class QualiMatchStats : MatchStats
	{
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
	}
}
