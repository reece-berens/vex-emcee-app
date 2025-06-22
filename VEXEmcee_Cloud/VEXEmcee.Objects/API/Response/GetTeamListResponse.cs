using VEXEmcee.Objects.Data.ClientApp.TeamList;

namespace VEXEmcee.Objects.API.Response
{
	public class GetTeamListResponse : BaseResponse
	{
		public bool EventStatsLoading { get; set; }
		/// <summary>
		/// There can be any type of program in this list, the UI will be able to handle the correct type based on the program tied to the event
		/// </summary>
		public List<Base> Teams { get; set; }
		public string ProgramAbbreviation { get; set; }
	}
}
