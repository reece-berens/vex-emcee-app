using System.Net;
using System.Text.Json.Serialization;

namespace VEXEmcee.Objects.API.Response
{
	public class BaseResponse
	{
		public string ErrorMessage { get; set; }
		[JsonIgnore]
		public HttpStatusCode StatusCode { get; set; } = HttpStatusCode.OK;
		public bool Success { get; set; }
	}
}
