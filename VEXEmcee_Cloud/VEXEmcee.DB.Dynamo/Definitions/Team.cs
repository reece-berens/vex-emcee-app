using Amazon.DynamoDBv2.DataModel;
using RE.Objects;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("Team")]
	public class Team
	{
		[DynamoDBHashKey]
		public int ID { get; set; }
		public string Number { get; set; }
		public string TeamName { get; set; }
		public string RobotName { get; set; }
		public string Organization { get; set; }
		public string CityState_denorm { get; set; }
		public int ProgramID { get; set; }
		[DynamoDBIgnore]
		public Grade? Grade { get; set; }
		[DynamoDBProperty("Grade")]
		public string GradeString { get; set; }
	}
}
