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
		public Dictionary<string, SkillAttempt> Skills { get; set; }

		[JsonPropertyName("E")]
		public List<TeamRef> ElimPartners { get; set; }
		[JsonPropertyName("R")]
		public int? CurrentQualiRank { get; set; }
	}
}
