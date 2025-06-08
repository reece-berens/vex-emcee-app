using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class Award
	{
		[JsonPropertyName("E")]
		public int EventID { get; set; }
		[JsonPropertyName("EN")]
		public string EventName_denorm { get; set; }
		[JsonPropertyName("AN")]
		public string AwardName { get; set; }
		[JsonPropertyName("Q")]
		public List<string> Qualifications { get; set; }
		[JsonPropertyName("OW")]
		public List<TeamRef> OtherTeamWinners { get; set; }
	}
}
