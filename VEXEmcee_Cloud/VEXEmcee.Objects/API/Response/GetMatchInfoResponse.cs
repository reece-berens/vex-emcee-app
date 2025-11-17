using VEXEmcee.Objects.Data.ClientApp.MatchInfo;

namespace VEXEmcee.Objects.API.Response
{
	public class GetMatchInfoResponse : BaseResponse
	{
		public bool EventStatsLoading { get; set; }
		/// <summary>
		/// There can be any type of program in this list, the UI will be able to handle the correct type based on the program tied to the event
		/// </summary>
		public Base MatchInfo { get; set; }
		public string ProgramAbbreviation { get; set; }
	}
}
