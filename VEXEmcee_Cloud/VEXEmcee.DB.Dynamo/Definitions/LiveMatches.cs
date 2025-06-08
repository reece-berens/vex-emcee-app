using Amazon.DynamoDBv2.DataModel;
using RE.Objects;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("LiveMatches")]
	public class LiveMatches
	{
		[DynamoDBHashKey]
		public int ID { get; set; }
		public int EventID { get; set; }
		public int DivisionID { get; set; }
		[DynamoDBIgnore]
		public MatchRoundType RoundType { get; set; }
		[DynamoDBProperty("RoundType")]
		public string RoundTypeString { get; set; }
		public int Instance { get; set; }
		public int MatchNumber { get; set; }
		public string Field { get; set; }
		public bool ScoreFinalized { get; set; }
		public string Name { get; set; }
		public List<Alliance> AllianceList { get; set; }
		public string MatchWinner { get; set; }
		public int BlueScore { get; set; }
		public int RedScore { get; set; }
	}
}
