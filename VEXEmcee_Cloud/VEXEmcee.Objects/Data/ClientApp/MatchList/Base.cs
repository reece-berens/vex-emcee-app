using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.ClientApp.MatchList
{
	[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
	[JsonDerivedType(typeof(V5RC), "V5RC")]
	public class Base
	{
		public string Key { get; set; }
		public string MatchName { get; set; }
		public int SortOrder { get; set; }
		public bool Scored { get; set; }
	}
}
