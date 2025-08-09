using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class DenormData
	{
		public DenormData()
		{
			AllMatches = new MatchStats();
			QualiMatches = new QualiMatchStats();
			ElimMatches = new MatchStats();
		}

		public DenormData(DenormData other)
		{
			AllMatches = new MatchStats(other.AllMatches);
			QualiMatches = new QualiMatchStats(other.QualiMatches);
			ElimMatches = new MatchStats(other.ElimMatches);
		}

		[JsonPropertyName("A")]
		public MatchStats AllMatches { get; set; }
		[JsonPropertyName("Q")]
		public QualiMatchStats QualiMatches { get; set; }
		[JsonPropertyName("E")]
		public MatchStats ElimMatches { get; set; }
	}
}
