using Amazon.DynamoDBv2.DataModel;
using RE.Objects;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("Event")]
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
		public Dictionary<int, List<int>> DivisionTeams { get; set; }
		public List<int> Teams_denorm { get; set; }
		public bool StatsReady { get; set; }
	}
}
