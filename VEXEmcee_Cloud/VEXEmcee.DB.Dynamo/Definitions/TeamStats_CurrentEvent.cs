using Amazon.DynamoDBv2.DataModel;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("TeamStatsCurrentEvent")]
	public class TeamStats_CurrentEvent
	{
		[DynamoDBHashKey]
		public string CompositeKey
		{
			get
			{
				return GetCompositeKey(EventID, TeamID);
			}
			set
			{
				string compositeKey = value;
				if (string.IsNullOrWhiteSpace(compositeKey))
				{
					EventID = 0;
					TeamID = 0;
				}
				else
				{
					string[] parts = compositeKey.Split('~');
					if (parts.Length == 2 && int.TryParse(parts[0], out int eventID) && int.TryParse(parts[1], out int teamID))
					{
						EventID = eventID;
						TeamID = teamID;
					}
					else
					{
						throw new FormatException("Composite key format is invalid. Expected format: 'eventID~teamID'");
					}
				}
			}
		}
		[DynamoDBRangeKey]
		public int EventID { get; set; }
		public int TeamID { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<TeamStatsCurrentCompiled>))]
		public TeamStatsCurrentCompiled CompiledStats { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<TeamStatsCurrentEvent>))]
		public TeamStatsCurrentEvent EventStats { get; set; }

		public static string GetCompositeKey(int eventID, int teamID)
		{
			return $"{eventID}~{teamID}";
		}
	}
}
