using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class Alliance
	{
		[JsonPropertyName("C")]
		public string Color { get; set; }
		[JsonPropertyName("S")]
		public int Score { get; set; }
		[JsonPropertyName("T")]
		public List<TeamRef> Teams { get; set; }
	}
}
