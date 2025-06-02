using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class DenormData
	{
		[JsonPropertyName("A")]
		public MatchStats AllMatches { get; set; }
		[JsonPropertyName("Q")]
		public QualiMatchStats QualiMatches { get; set; }
		[JsonPropertyName("E")]
		public MatchStats ElimMatches { get; set; }
	}
}
