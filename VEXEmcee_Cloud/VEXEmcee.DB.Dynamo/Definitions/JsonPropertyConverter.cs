using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System.Text.Json;

namespace VEXEmcee.DB.Dynamo.Definitions
{
	public class JsonPropertyConverter<T> : IPropertyConverter
	{
		public DynamoDBEntry ToEntry(object value)
		{
			if (value == null) return new Primitive { Value = null };
			string json = JsonSerializer.Serialize((T)value);
			return new Primitive(json);
		}

		public object FromEntry(DynamoDBEntry entry)
		{
			var primitive = entry as Primitive;
			if (primitive?.Value == null) return default(T);
			return JsonSerializer.Deserialize<T>(primitive.Value.ToString());
		}
	}
}
