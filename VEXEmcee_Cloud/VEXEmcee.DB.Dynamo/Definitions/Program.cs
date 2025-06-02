using Amazon.DynamoDBv2.DataModel;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("Program")]
	public class Program
	{
		[DynamoDBHashKey]
		public int ID { get; set; }
		public string Name { get; set; }
		public string Abbreviation { get; set; }
		public bool Selectable { get; set; }
	}
}
