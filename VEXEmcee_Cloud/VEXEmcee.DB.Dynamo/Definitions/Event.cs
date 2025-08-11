using Amazon.DynamoDBv2.DataModel;
using RE.Objects;
using System.Diagnostics;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("Event")]
	[DebuggerDisplay("{ID} {Name}")]
	public class Event
	{
		[DynamoDBHashKey]
		public int ID { get; set; }
		public int SeasonID { get; set; }
		public string Name { get; set; }
		public string SKU { get; set; }
		public DateTime StartDate { get; set; }
		public DateTime EndDate { get; set; }
		public int ProgramID_denorm { get; set; }
		public bool Finalized { get; set; }
		[DynamoDBIgnore]
		public EventLevel Level { get; set; }
		[DynamoDBProperty("Level")]
		public string LevelString { get; set; }
		[DynamoDBIgnore]
		public EventType Type { get; set; }
		[DynamoDBProperty("Type")]
		public string TypeString { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<Dictionary<int, string>>))]
		public Dictionary<int, string> DivisionNames { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<Dictionary<int, List<int>>>))]
		public Dictionary<int, List<int>> DivisionTeams { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<List<int>>))]
		public List<int> Teams_denorm { get; set; }
		public bool StatsReady { get; set; }
		public bool StatsRequested { get; set; } //this flag is used to ensure we only request stats once per event
		public DateTime? LastCurrentStatsCheck { get; set; } //this is used to determine when the last check for current match/ranking stats was done for a user-requested event
	}
}
