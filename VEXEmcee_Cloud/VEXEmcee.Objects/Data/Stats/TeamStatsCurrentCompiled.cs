using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class TeamStatsCurrentCompiled
	{
		[JsonPropertyName("D")]
		public DenormData DenormData { get; set; }

		[JsonPropertyName("S")]
		public Dictionary<string, CurrentCompiledSkillType> Skills { get; set; }
	}
}
