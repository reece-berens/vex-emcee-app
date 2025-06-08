using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class QualiStats
	{
		[JsonPropertyName("W")]
		public int Win { get; set; }
		[JsonPropertyName("L")]
		public int Loss { get; set; }
		[JsonPropertyName("T")]
		public int Tie { get; set; }
		[JsonPropertyName("R")]
		public int Rank { get; set; }
		[JsonPropertyName("WP")]
		public int WP { get; set; }
		[JsonPropertyName("AP")]
		public int AP { get; set; }
		[JsonPropertyName("SP")]
		public int SP { get; set; }
		[JsonPropertyName("H")]
		public int HighScore { get; set; }
		[JsonPropertyName("APPM")]
		public double AveragePPM { get; set; }
		[JsonPropertyName("TP")]
		public int TotalPoints { get; set; }
	}
}
