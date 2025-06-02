using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class CurrentCompiledSkillType
	{
		[JsonPropertyName("A")]
		public int SeasonAttempts { get; set; }

		[JsonPropertyName("H")]
		public int SeasonHighScore { get; set; }

		[JsonPropertyName("T")]
		public bool SeasonHighScoreToday { get; set; }
	}
}
