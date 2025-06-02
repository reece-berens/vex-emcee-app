using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System.Text.Json;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	[DynamoDBTable("TeamStatsCurrentEvent")]
	public class TeamStats_CurrentEvent
	{
		[DynamoDBHashKey]
		public int EventID { get; set; }
		[DynamoDBRangeKey]
		public int TeamID { get; set; }
		[DynamoDBProperty(typeof(CompiledStatsTypeConverter))]
		public TeamStatsCurrentCompiled CompiledStats { get; set; }
		[DynamoDBProperty(typeof(CurrentEventStatsTypeConverter))]
		public TeamStatsCurrentEvent EventStats { get; set; }
	}

	public class CompiledStatsTypeConverter : IPropertyConverter
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
				return JsonSerializer.Deserialize<TeamStatsCurrentCompiled>(entryString);
			}
		}

		public DynamoDBEntry ToEntry(object value)
		{
			if (value is TeamStatsCurrentCompiled)
			{
				string json = JsonSerializer.Serialize(value as TeamStatsCurrentCompiled);
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

	public class CurrentEventStatsTypeConverter : IPropertyConverter
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
				return JsonSerializer.Deserialize<TeamStatsCurrentEvent>(entryString);
			}
		}

		public DynamoDBEntry ToEntry(object value)
		{
			if (value is TeamStatsCurrentEvent)
			{
				string json = JsonSerializer.Serialize(value as TeamStatsCurrentEvent);
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
