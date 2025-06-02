using Amazon.DynamoDBv2.DataModel;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("Session")]
	public class Session
	{
		[DynamoDBHashKey]
		public string ID { get; set; }
		public int SelectedEventID { get; set; }
		public int SelectedDivisionID { get; set; }
		public DateTime StartDateTime { get; set; }
		public Dictionary<int, List<string>> ShownSimpleStat { get; set; }
	}
}
