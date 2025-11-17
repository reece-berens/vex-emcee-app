using VEXEmcee.Objects.Data.ClientApp;

namespace VEXEmcee.Objects.API.Response
{
	public class GetREEventListResponse : BaseResponse
	{
		public List<REEvent> Events { get; set; }
		public int NextPage { get; set; }
		public int PageSize { get; set; }
		public int TotalCount { get; set; }
	}
}
