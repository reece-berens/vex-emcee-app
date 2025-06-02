using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class QualiMatchDetail : MatchDetail
	{
		[JsonPropertyName("C")]
		public string AllianceColor_denorm { get; set; }
		[JsonPropertyName("S")]
		public int AllianceScore_denorm { get; set; }
	}
}
