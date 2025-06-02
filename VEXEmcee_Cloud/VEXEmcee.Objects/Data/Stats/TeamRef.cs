using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.Stats
{
	public class TeamRef
	{
		[JsonPropertyName("I")]
		public int ID { get; set; }
		[JsonPropertyName("N")]
		public string Number { get; set; }
	}
}
