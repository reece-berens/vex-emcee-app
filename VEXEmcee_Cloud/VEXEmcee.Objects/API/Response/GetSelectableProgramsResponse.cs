using VEXEmcee.Objects.Data.ClientApp;

namespace VEXEmcee.Objects.API.Response
{
	public class GetSelectableProgramsResponse : BaseResponse
	{
		public List<Program> Programs { get; set; }
	}
}
