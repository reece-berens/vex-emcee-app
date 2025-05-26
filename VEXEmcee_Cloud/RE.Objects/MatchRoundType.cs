using System.Text.Json.Serialization;

namespace RE.Objects
{
	[JsonConverter(typeof(JsonNumberEnumConverter<MatchRoundType>))]
	public enum MatchRoundType
	{
		Practice = 1,
		Qualification = 2,
		QuarterFinal = 3,
		SemiFinal = 4,
		Final = 5,
		Round16 = 6,
		Round32 = 7,
		Round64 = 8,
		Round128 = 9
	}
}
