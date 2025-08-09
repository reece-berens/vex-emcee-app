using Amazon.DynamoDBv2.DataModel;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("TeamStatsSeason")]
	public class TeamStats_Season
	{
		[DynamoDBHashKey]
		public string CompositeKey
		{
			get
			{
				return GetCompositeKey(SeasonID, TeamID);
			}
			set
			{
				string compositeKey = value;
				if (string.IsNullOrWhiteSpace(compositeKey))
				{
					SeasonID = 0;
					TeamID = 0;
				}
				else
				{
					string[] parts = compositeKey.Split('~');
					if (parts.Length == 2 && int.TryParse(parts[0], out int eventID) && int.TryParse(parts[1], out int teamID))
					{
						SeasonID = eventID;
						TeamID = teamID;
					}
					else
					{
						throw new FormatException("Composite key format is invalid. Expected format: 'seasonID~teamID'");
					}
				}
			}
		}
		[DynamoDBRangeKey]
		public int TeamID { get; set; }
		public int SeasonID { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<TeamStatsSeason>))]
		public TeamStatsSeason Stats { get; set; }
		[DynamoDBProperty(typeof(JsonPropertyConverter<List<int>>))]
		public List<int> EventsIncluded { get; set; }

		public static string GetCompositeKey(int seasonID, int teamID)
		{
			return $"{seasonID}~{teamID}";
		}
	}
}
