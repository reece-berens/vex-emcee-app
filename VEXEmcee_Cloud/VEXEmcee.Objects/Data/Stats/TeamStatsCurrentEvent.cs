using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class TeamStatsCurrentEvent
	{
		public TeamStatsCurrentEvent()
		{
			DenormData = new();
			ElimPartners = [];
			Skills = [];
		}
		[JsonPropertyName("D")]
		public DenormData DenormData { get; set; }

		[JsonPropertyName("S")]
		public Dictionary<string, SkillType> Skills { get; set; }

		[JsonPropertyName("E")]
		public List<TeamRef> ElimPartners { get; set; }
	}
}
