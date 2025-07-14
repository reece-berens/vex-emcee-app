using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.API.Lambda
{
	public class ValidateSession
	{
		public ValidateSession()
		{
			Console.WriteLine("inside the constructor of ValidateSession");
			VEXEmcee.DB.Dynamo.Dynamo.Initialize(region: Amazon.RegionEndpoint.USEast1);
		}

		public async Task<APIGatewayCustomAuthorizerV2SimpleResponse> FunctionHandler(APIGatewayCustomAuthorizerV2Request apiRequest, ILambdaContext context)
		{
			ValidateSessionRequest vexEmceeRequest = new();
			ValidateSessionResponse vexEmceeResponse;
			string[] cookieList = apiRequest.Cookies?.ToArray();
			vexEmceeRequest.Session = Generic.GetSessionCookie(cookieList);

			vexEmceeResponse = await PublicMethods.ValidateSession(vexEmceeRequest);

			APIGatewayCustomAuthorizerV2SimpleResponse apiResponse = new();
			apiResponse.IsAuthorized = vexEmceeResponse.Success;
			return apiResponse;
		}
	}
}
