using VEXEmcee.Objects.Data.ClientApp.Display;

namespace VEXEmcee.Objects.Data.ClientApp
{
	public class TeamInfo
	{
		public int ID { get; set; }
		public string Location { get; set; }
		public string Number { get; set; }
		public string TeamName { get; set; }
		public int NextTeamID { get; set; }
		public int PreviousTeamID { get; set; }
		public List<SectionHeader> Sections { get; set; }
	}
}
