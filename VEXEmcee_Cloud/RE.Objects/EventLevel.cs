using System.Text.Json.Serialization;

namespace RE.Objects
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EventLevel
    {
        World,
        National,
        Regional,
        State,
        Signature,
        Other
    }
}