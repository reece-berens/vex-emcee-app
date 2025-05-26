using System.Text.Json.Serialization;

namespace RE.Objects
{
	[JsonConverter(typeof(JsonStringEnumConverter))]
	public enum SkillType
	{
		driver,
		programming,
		package_delivery_time
	}
}
