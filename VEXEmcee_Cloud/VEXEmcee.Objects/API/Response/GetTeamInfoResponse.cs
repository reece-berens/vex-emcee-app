using VEXEmcee.Objects.Data.ClientApp;

namespace VEXEmcee.Objects.API.Response
{
	public class GetTeamInfoResponse : BaseResponse
	{
		public bool EventStatsLoading { get; set; }
		/// <summary>
		/// There can be any type of team in this object, the UI will be able to handle the correct type based on the program tied to the event
		/// </summary>
		public TeamInfo TeamInfo { get; set; }
		public string ProgramAbbreviation { get; set; }
	}
}
