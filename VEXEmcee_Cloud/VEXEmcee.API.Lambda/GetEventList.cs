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
	public class GetEventList
	{
		public GetEventList()
		{
			Console.WriteLine("inside the constructor of GetEventList");
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
				Console.WriteLine($"Constructor of GetEventList: Invalid response getting RE API key: {paramResponse.HttpStatusCode}");
			}
		}

		public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest apiRequest, ILambdaContext context)
		{
			GetREEventListRequest vexEmceeRequest = new();
			GetREEventListResponse vexEmceeResponse;
			vexEmceeRequest.Session = Generic.GetSessionCookie(apiRequest.Cookies);
			Generic.BuildSessionInfo(vexEmceeRequest, apiRequest.RequestContext?.Authorizer);

			if (apiRequest.QueryStringParameters == null)
			{
				vexEmceeResponse = new GetREEventListResponse
				{
					Success = false,
					StatusCode = HttpStatusCode.BadRequest,
					ErrorMessage = "Query string parameters are required."
				};
			}
			else
			{
				if (apiRequest.QueryStringParameters.TryGetValue("programID", out string programParam) && int.TryParse(programParam, out int programInt))
				{
					vexEmceeRequest.ProgramID = programInt;
				}
				if (apiRequest.QueryStringParameters.TryGetValue("pageSize", out string pageSizeParam) && int.TryParse(pageSizeParam, out int pageSizeInt))
				{
					vexEmceeRequest.PageSize = pageSizeInt;
				}
				if (apiRequest.QueryStringParameters.TryGetValue("page", out string pageParam) && int.TryParse(pageParam, out int pageInt))
				{
					vexEmceeRequest.Page = pageInt;
				}
				if (apiRequest.QueryStringParameters.TryGetValue("region", out string regionParam))
				{
					vexEmceeRequest.Region = regionParam;
				}
				if (apiRequest.QueryStringParameters.TryGetValue("sku", out string skuParam))
				{
					vexEmceeRequest.SKU = skuParam;
				}

				vexEmceeResponse = await PublicMethods.GetREEventList(vexEmceeRequest);
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
