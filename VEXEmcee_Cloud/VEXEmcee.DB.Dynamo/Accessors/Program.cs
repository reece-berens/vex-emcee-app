using Amazon.DynamoDBv2.DataModel;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	public static class Program
	{
		public static async Task<List<Definitions.Program>> GetSelectableProgramList()
		{
			await Common.ValidateTable<Definitions.Program>();
			List<Definitions.Program> returnValue = [];

			IAsyncSearch<Definitions.Program> scanResult = Dynamo.Context.FromScanAsync<Definitions.Program>(new Amazon.DynamoDBv2.DocumentModel.ScanOperationConfig()
			{
				FilterExpression = new Amazon.DynamoDBv2.DocumentModel.Expression
				{
					ExpressionStatement = "Selectable = :selectable",
					ExpressionAttributeValues = new Dictionary<string, Amazon.DynamoDBv2.DocumentModel.DynamoDBEntry>()
					{
						{":selectable", new Amazon.DynamoDBv2.DocumentModel.DynamoDBBool(true) }
					}
				}
			});

			try
			{
				do
				{
					List<Definitions.Program> tempItems = await scanResult.GetNextSetAsync();
					returnValue.AddRange(tempItems);
				} while (!scanResult.IsDone);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error retrieving selectable programs: {ex.Message}");
			}

			return returnValue;
		}
	}
}
