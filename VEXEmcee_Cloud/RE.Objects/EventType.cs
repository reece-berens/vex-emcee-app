using System.Text.Json.Serialization;

namespace RE.Objects
{
	[JsonConverter(typeof(JsonStringEnumConverter))]
	public enum EventType
	{
		tournament,
		league,
		workshop,
		[JsonPropertyName("virtual")]
		Virtual
	}
}
