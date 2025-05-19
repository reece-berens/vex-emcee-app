using System.Text.Json.Serialization;

namespace RE.Objects
{
	[JsonConverter(typeof(JsonStringEnumConverter))]
	public enum Grade
    {
        College,
        High_School,
        Middle_School,
        Elementary_School
    }
}