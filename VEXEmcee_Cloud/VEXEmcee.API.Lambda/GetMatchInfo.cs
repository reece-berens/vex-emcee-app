using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Net;
using System.Text.Json;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Lambda
{
	public class GetMatchInfo
	{
		public GetMatchInfo()
		{
			Console.WriteLine("inside the constructor of GetMatchInfo");
			VEXEmcee.DB.Dynamo.Dynamo.Initialize(region: Amazon.RegionEndpoint.USEast1);
		}

		public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest apiRequest, ILambdaContext context)
		{
			GetMatchInfoRequest vexEmceeRequest = new();
			GetMatchInfoResponse vexEmceeResponse;
			vexEmceeRequest.Session = Generic.GetSessionHeader(apiRequest.Headers);
			Generic.BuildSessionInfo(vexEmceeRequest, apiRequest.RequestContext?.Authorizer);

			if (apiRequest.QueryStringParameters == null)
			{
				vexEmceeResponse = new GetMatchInfoResponse
				{
					Success = false,
					StatusCode = HttpStatusCode.BadRequest,
					ErrorMessage = "Query string parameters are required."
				};
			}
			else
			{
				if (apiRequest.QueryStringParameters.TryGetValue("matchKey", out string matchParam))
				{
					vexEmceeRequest.MatchKey = matchParam;
				}

				vexEmceeResponse = await PublicMethods.GetMatchInfo(vexEmceeRequest);
			}

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
