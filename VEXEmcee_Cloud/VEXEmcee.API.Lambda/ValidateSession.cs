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
			APIGatewayCustomAuthorizerV2SimpleResponse apiResponse = new();
			try
			{
				ValidateSessionRequest vexEmceeRequest = new();
				ValidateSessionResponse vexEmceeResponse;
				vexEmceeRequest.Session = Generic.GetSessionHeader(apiRequest.Headers);

				foreach (string tempString in apiRequest.Headers.Keys)
				{
					Console.WriteLine($"Header: {tempString} : {apiRequest.Headers[tempString]}");
                }

				vexEmceeResponse = await PublicMethods.ValidateSession(vexEmceeRequest);

				apiResponse.IsAuthorized = vexEmceeResponse.Success;
				if (apiResponse.IsAuthorized)
				{
					apiResponse.Context = new()
					{
						{ "EventID", vexEmceeResponse.EventID },
						{ "DivisionID", vexEmceeResponse.DivisionID }
					};
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception in ValidateSession: {ex}");
				apiResponse.IsAuthorized = false;
				return apiResponse;
			}
			
			return apiResponse;
		}
	}
}
