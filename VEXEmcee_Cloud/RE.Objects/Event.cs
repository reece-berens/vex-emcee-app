using System.Text.Json.Serialization;

namespace RE.Objects
{
	public class Event
	{
		public int Id { get; set; }
		public string Sku { get; set; }
		public string Name { get; set; }
		public DateTime Start { get; set; }
		public DateTime End { get; set; }
		public IdInfo Season { get; set; }
		public IdInfo Program { get; set; }
		public Location Location { get; set; }
		public Dictionary<string, Location> Locations { get; set; }
		public List<Division> Divisions { get; set; }
		public EventLevel Level { get; set; }
		public bool Ongoing { get; set; }
		[JsonPropertyName("awards_finalized")]
		public bool AwardsFinalized { get; set; }
		public EventType EventType { get; set; }
	}
}
