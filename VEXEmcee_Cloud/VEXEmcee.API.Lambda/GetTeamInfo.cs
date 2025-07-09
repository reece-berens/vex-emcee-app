using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Net;
using System.Text.Json;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Lambda
{
	public class GetTeamInfo
	{
		public GetTeamInfo()
		{
			Console.WriteLine("inside the constructor of GetTeamInfo");
			VEXEmcee.DB.Dynamo.Dynamo.Initialize(region: Amazon.RegionEndpoint.USEast1);
		}

		public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest apiRequest, ILambdaContext context)
		{
			GetTeamInfoRequest vexEmceeRequest = new();
			GetTeamInfoResponse vexEmceeResponse;
			vexEmceeRequest.Session = Generic.GetSessionCookie(apiRequest.Cookies);

			if (apiRequest.QueryStringParameters == null)
			{
				vexEmceeResponse = new GetTeamInfoResponse
				{
					Success = false,
					StatusCode = HttpStatusCode.BadRequest,
					ErrorMessage = "Query string parameters are required."
				};
			}
			else
			{
				if (apiRequest.QueryStringParameters.TryGetValue("teamID", out string teamParam) && int.TryParse(teamParam, out int teamInt))
				{
					vexEmceeRequest.TeamID = teamInt;
				}

				vexEmceeResponse = await PublicMethods.GetTeamInfo(vexEmceeRequest);
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
