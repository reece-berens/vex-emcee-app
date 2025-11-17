using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using System.Net;
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
			AmazonSimpleSystemsManagementClient ssmClient = new(Amazon.RegionEndpoint.USEast1);
			GetParameterResponse paramResponse = ssmClient.GetParameterAsync(new()
			{
				Name = Generic.REAPIParamStoreKey
			}).GetAwaiter().GetResult();
			if (paramResponse.HttpStatusCode == HttpStatusCode.OK && paramResponse.Parameter != null)
			{
				RE.API.Accessor.SetAccessToken(paramResponse.Parameter.Value);
			}
			else
			{
				Console.WriteLine($"Constructor of RegisterSessionEventDivision: Invalid response getting RE API key: {paramResponse.HttpStatusCode}");
			}
		}

		public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest apiRequest, ILambdaContext context)
		{
			RegisterSessionEventDivisionRequest vexEmceeRequest = JsonSerializer.Deserialize<RegisterSessionEventDivisionRequest>(apiRequest.Body);
			RegisterSessionEventDivisionResponse vexEmceeResponse;
			vexEmceeRequest.Session = Generic.GetSessionHeader(apiRequest.Headers);

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
