using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.ClientApp.TeamList
{
	[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
	[JsonDerivedType(typeof(V5RC), "V5RC")]
	public class Base
	{
		public int ID { get; set; }
		public bool InDivision { get; set; }
		public string Number { get; set; }
		public int NumberSortOrder { get; set; }
		public string TeamName { get; set; }
	}
}
