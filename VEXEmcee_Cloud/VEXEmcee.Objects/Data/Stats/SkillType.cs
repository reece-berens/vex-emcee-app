using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class SkillType
	{
		[JsonPropertyName("A")]
		public Dictionary<int, SkillAttempt> AttemptList { get; set; }
		[JsonPropertyName("SA")]
		public int SeasonAttempts { get; set; }
		[JsonPropertyName("H")]
		public int SeasonHighScore { get; set; }
	}
}
