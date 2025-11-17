using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class ElimMatchDetail : MatchDetail
	{
		[JsonPropertyName("T")]
		public string TeamAlliance_denorm { get; set; }
		[JsonPropertyName("S")]
		public int TeamScore_denorm { get; set; }
	}
}
