using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Text.Json;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Lambda
{
	public class RegisterSessionEventDivision
	{
		public RegisterSessionEventDivision()
		{
			Console.WriteLine("inside the constructor of RegisterSessionEventDivision");
			VEXEmcee.DB.Dynamo.Dynamo.Initialize(region: Amazon.RegionEndpoint.USEast1);
		}

		public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest apiRequest, ILambdaContext context)
		{
			RegisterSessionEventDivisionRequest vexEmceeRequest = JsonSerializer.Deserialize<RegisterSessionEventDivisionRequest>(apiRequest.Body);
			RegisterSessionEventDivisionResponse vexEmceeResponse;
			vexEmceeRequest.Session = Generic.GetSessionCookie(apiRequest.Cookies);

			vexEmceeResponse = await PublicMethods.RegisterSessionEventDivision(vexEmceeRequest);

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
