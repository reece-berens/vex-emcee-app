using Amazon.Lambda.Core;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using System.Net;
using System.Text.Json;
using VEXEmcee.Logic;
using VEXEmcee.Objects.Lambda;

namespace VEXEmcee.API.Lambda
{
	public class BuildEventStats
	{
		public BuildEventStats()
		{
			Console.WriteLine("inside the constructor of BuildEventStats");
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
				Console.WriteLine($"Constructor of BuildEventStats: Invalid response getting RE API key: {paramResponse.HttpStatusCode}");
			}
		}

		public async Task<bool> FunctionHandler(BuildEventStatsRequest request, ILambdaContext context)
		{
			Console.WriteLine("Starting with invocation of FunctionHandler");
			string tempPayload = JsonSerializer.Serialize(request);
			Console.WriteLine(tempPayload);

			bool response = await PublicMethods.BuildEventStats(request);

			Console.WriteLine("Ending with invocation of FunctionHandler");
			return response;
		}
	}
}
