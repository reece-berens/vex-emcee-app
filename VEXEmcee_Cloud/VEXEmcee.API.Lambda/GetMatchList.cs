using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Text.Json;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Lambda
{
	public class GetMatchList
	{
		public GetMatchList()
		{
			Console.WriteLine("inside the constructor of GetMatchList");
			VEXEmcee.DB.Dynamo.Dynamo.Initialize(region: Amazon.RegionEndpoint.USEast1);
		}

		public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest apiRequest, ILambdaContext context)
		{
			GetMatchListRequest vexEmceeRequest = new();
			GetMatchListResponse vexEmceeResponse;
			vexEmceeRequest.Session = Generic.GetSessionCookie(apiRequest.Cookies);
			Generic.BuildSessionInfo(vexEmceeRequest, apiRequest.RequestContext?.Authorizer);

			vexEmceeResponse = await PublicMethods.GetMatchList(vexEmceeRequest);

			APIGatewayHttpApiV2ProxyResponse apiResponse = new();
			apiResponse.StatusCode = vexEmceeResponse.Success ? 200 : ((int)vexEmceeResponse.StatusCode);
			apiResponse.Body = JsonSerializer.Serialize(vexEmceeResponse);
			apiResponse.Headers = new Dictionary<string, string>
			{
				{ "Content-Type", "application/json" }
			};
			return apiResponse;
		}
	}
}
