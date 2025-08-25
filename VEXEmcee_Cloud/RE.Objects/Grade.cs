using System.Text.Json;
using System.Text.Json.Serialization;

namespace RE.Objects
{
	[JsonConverter(typeof(GradeJsonConverter))]
	public enum Grade
	{
		College,
		High_School,
		Middle_School,
		Elementary_School,
		Unknown
	}

	public class GradeJsonConverter : JsonConverter<Grade>
	{
		public override Grade Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			var value = reader.GetString();
			return value switch
			{
				"High School" => Grade.High_School,
				"Middle School" => Grade.Middle_School,
				"Elementary School" => Grade.Elementary_School,
				"College" => Grade.College,
				_ => Grade.Unknown
			};
		}

		public override void Write(Utf8JsonWriter writer, Grade value, JsonSerializerOptions options)
		{
			var str = value switch
			{
				Grade.High_School => "High School",
				Grade.Middle_School => "Middle School",
				Grade.Elementary_School => "Elementary School",
				Grade.College => "College",
				_ => "Unknown"
			};
			writer.WriteStringValue(str);
		}
	}
}
