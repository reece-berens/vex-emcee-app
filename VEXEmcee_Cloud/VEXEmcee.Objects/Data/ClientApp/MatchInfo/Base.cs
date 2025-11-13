using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.Data.ClientApp.MatchInfo
{
	[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
	[JsonDerivedType(typeof(V5RC), "V5RC")]
	public class Base
	{
		/// <summary>
		/// Which number this is in an elimination round (ex. QF 1, QF 2, etc.)
		/// </summary>
		public int MatchInstance { get; set; }

		/// <summary>
		/// Which match this is (ex. Quali 1, Quali 2, Finals match number 1/2/3)
		/// </summary>
		public int MatchNumber { get; set; }

		/// <summary>
		/// Qualification, Round of 16, QF, SF, etc.
		/// </summary>
		public int MatchRound { get; set; }
		
		public bool Scored { get; set; }
		public string NextMatchKey { get; set; }
		public string PreviousMatchKey { get; set; }
	}
}
