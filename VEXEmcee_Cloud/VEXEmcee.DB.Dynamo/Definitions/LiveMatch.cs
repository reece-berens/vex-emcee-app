using Amazon.DynamoDBv2.DataModel;
using RE.Objects;
using System.Diagnostics;
using System.Text.Json.Serialization;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("LiveMatch")]
	[DebuggerDisplay("{Name}")]
	public class LiveMatch
	{
		[DynamoDBHashKey]
		public int ID { get; set; }
		[DynamoDBRangeKey]
		public int EventID { get; set; }
		public int DivisionID { get; set; }
		[DynamoDBIgnore]
		public MatchRoundType Round { get; set; }
		[DynamoDBProperty("Round")]
		public string RoundString { get; set; }
		public int Instance { get; set; }
		public int MatchNumber { get; set; }
		public string Field { get; set; }
		public bool ScoreFinalized { get; set; }
		public string Name { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<List<LiveMatchAlliance>>))]
		public List<LiveMatchAlliance> Alliances { get; set; }
		public string MatchWinner { get; set; }
		public int BlueScore { get; set; }
		public int RedScore { get; set; }
		public DateTime? LastUpdated { get; set; }
	}

	public class LiveMatchAlliance
	{
		[JsonPropertyName("C")]
		public string Color { get; set; }
		[JsonPropertyName("S")]
		public int Score { get; set; }
		[JsonPropertyName("T")]
		public List<LiveMatchAllianceTeam> Teams { get; set; }
	}

	public class LiveMatchAllianceTeam
	{
		[JsonPropertyName("I")]
		public int ID { get; set; }
		[JsonPropertyName("N")]
		public string Number { get; set; }
	}
}
