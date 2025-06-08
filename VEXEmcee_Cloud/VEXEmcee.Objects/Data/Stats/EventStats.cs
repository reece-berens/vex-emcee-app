using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class EventStats
	{
		[JsonPropertyName("E")]
		public int EventID { get; set; }
		[JsonPropertyName("EN")]
		public string EventName_denorm { get; set; }
		[JsonPropertyName("QS")]
		public QualiStats QualiStats { get; set; }
		[JsonPropertyName("QM")]
		public List<QualiMatchDetail> QualiMatches { get; set; }
		[JsonPropertyName("EP")]
		public List<TeamRef> ElimPartners { get; set; }
		[JsonPropertyName("EM")]
		public List<ElimMatchDetail> ElimMatches { get; set; }
	}
}
