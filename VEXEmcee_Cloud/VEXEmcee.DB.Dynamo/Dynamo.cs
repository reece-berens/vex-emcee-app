using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;

namespace VEXEmcee.DB.Dynamo
{
	public static class Dynamo
	{
		internal static AmazonDynamoDBClient Client { get; private set; }

		internal static DynamoDBContext Context { get; private set; }

		public static void Initialize(string accessKey = null, string secretKey = null, RegionEndpoint region = null)
		{
			if (Client != null)
			{
				throw new InvalidOperationException("DynamoDB client is already initialized.");
			}
			if (string.IsNullOrWhiteSpace(accessKey) && string.IsNullOrWhiteSpace(secretKey))
			{
				Client = new AmazonDynamoDBClient(region ?? RegionEndpoint.USEast1);
			}
			else
			{
				Client = new AmazonDynamoDBClient(accessKey, secretKey, region ?? RegionEndpoint.USEast1);
			}

			DynamoDBContextBuilder builder = new();
			builder.ConfigureContext(x =>
			{
				
			});
			builder.WithDynamoDBClient(() => Client);
			Context = builder.Build();
		}
	}
}
