using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System.Text.Json;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("TeamStatsSeason")]
	public class TeamStats_Season
	{
		[DynamoDBHashKey]
		public int TeamID { get; set; }
		[DynamoDBProperty(typeof(SeasonStatsTypeConverter))]
		public TeamStatsSeason Stats { get; set; }
		public List<int> EventsIncluded { get; set; }
	}

	public class SeasonStatsTypeConverter : IPropertyConverter
	{
		public object FromEntry(DynamoDBEntry entry)
		{
			string entryString = entry.AsString();
			if (string.IsNullOrWhiteSpace(entryString))
			{
				return null;
			}
			else
			{
				return JsonSerializer.Deserialize<TeamStatsSeason>(entryString);
			}
		}

		public DynamoDBEntry ToEntry(object value)
		{
			if (value is TeamStatsSeason)
			{
				string json = JsonSerializer.Serialize(value as TeamStatsSeason);
				return new Primitive
				{
					Value = json,
					Type = DynamoDBEntryType.String
				};
			}
			else
			{
				return new Primitive
				{
					Value = null,
					Type = DynamoDBEntryType.String
				};
			}
		}
	}
}
