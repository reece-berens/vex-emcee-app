using Amazon.DynamoDBv2.DataModel;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("Season")]
	public class Season
	{
		[DynamoDBHashKey]
		public int ID { get; set; }
		public int ProgramID { get; set; }
		public string FullName { get; set; }
		public string SimpleName { get; set; }
		public int YearStart { get; set; }
		public int YearEnd { get; set; }
		public bool Active { get; set; }
	}
}
