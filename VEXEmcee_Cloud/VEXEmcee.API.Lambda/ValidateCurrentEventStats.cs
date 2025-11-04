using Amazon.Lambda.Core;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using System.Net;
using VEXEmcee.Logic;
using VEXEmcee.Objects.API.Request;

namespace VEXEmcee.API.Lambda
{
	public class ValidateCurrentEventStats
	{
		public ValidateCurrentEventStats()
		{
			Console.WriteLine("inside the constructor of ValidateCurrentEventStats");
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
				Console.WriteLine($"Constructor of ValidateCurrentEventStats: Invalid response getting RE API key: {paramResponse.HttpStatusCode}");
			}
		}

		public async Task FunctionHandler(ValidateCurrentEventStatsRequest request, ILambdaContext context)
		{
			Console.WriteLine($"Starting with invocation of FunctionHandler - {request.EventID}");

			await PublicMethods.ValidateCurrentEventStats(request.EventID);

			Console.WriteLine("Ending with invocation of FunctionHandler");
		}
	}
}
