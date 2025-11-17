using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class TeamStatsSeason
	{
		public TeamStatsSeason()
		{
			Awards = [];
			DenormData = new();
			Skills = [];
			Events = [];
		}
		[JsonPropertyName("D")]
		public DenormData DenormData { get; set; }
		[JsonPropertyName("A")]
		public List<Award> Awards { get; set; }
		[JsonPropertyName("S")]
		public Dictionary<string, SkillType> Skills { get; set; }
		[JsonPropertyName("E")]
		public List<EventStats> Events { get; set; }
	}
}
