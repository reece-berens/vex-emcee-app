using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Text.Json;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Lambda
{
	public class RegisterNewSession
	{
		public RegisterNewSession()
		{
			Console.WriteLine("inside the constructor of RegisterNewSession");
			VEXEmcee.DB.Dynamo.Dynamo.Initialize(region: Amazon.RegionEndpoint.USEast1);
		}

		public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest apiRequest, ILambdaContext context)
		{
			RegisterNewSessionRequest vexEmceeRequest = new();
			vexEmceeRequest.Session = Guid.NewGuid().ToString();

			RegisterNewSessionResponse vexEmceeResponse = await PublicMethods.RegisterNewSession(vexEmceeRequest);

			APIGatewayHttpApiV2ProxyResponse apiResponse = new();
			if (vexEmceeResponse.Success)
			{
				apiResponse.StatusCode = 200;
				apiResponse.Cookies = [$"VEXEmceeSession={vexEmceeRequest.Session}"];
			}
			else
			{
				apiResponse.StatusCode = ((int)vexEmceeResponse.StatusCode);
			}
			apiResponse.Body = JsonSerializer.Serialize(vexEmceeResponse);
			apiResponse.Headers = new Dictionary<string, string>
			{
				{ "Content-Type", "application/json" }
			};
			return apiResponse;
		}
	}
}
