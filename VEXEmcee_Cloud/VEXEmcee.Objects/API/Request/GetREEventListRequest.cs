namespace VEXEmcee.Objects.API.Request
{
	public class GetREEventListRequest : BaseRequest
	{
		public int? PageSize { get; set; }
		public int? Page { get; set; }
		public int ProgramID { get; set; }
		public string Region { get; set; }
		public string SKU { get; set; }
	}
}
