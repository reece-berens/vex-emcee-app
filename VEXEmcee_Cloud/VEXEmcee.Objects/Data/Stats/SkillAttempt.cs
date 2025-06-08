using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class SkillAttempt
	{
		[JsonPropertyName("A")]
		public int Attempts { get; set; }
		[JsonPropertyName("H")]
		public int HighScore { get; set; }
	}
}
