using VEXEmcee.Objects.Data.ClientApp.Display;

namespace VEXEmcee.Objects.Data.ClientApp.MatchInfo
{
	public class V5RC_Team
	{
		public int ID { get; set; }
		public string SimpleStat { get; set; }
		public string TeamLocator { get; set; }
		public string TeamName { get; set; }
		public string TeamNumber { get; set; }
		public List<SectionHeader> Stats { get; set; }
	}
}
