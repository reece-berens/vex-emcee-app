using Amazon.DynamoDBv2.DataModel;
using System.Reflection;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	public static class Program
	{
		/// <summary>
		/// Asynchronously retrieves all programs from the DynamoDB "Program" table that are marked as selectable.
		/// The method first ensures the table exists, then scans for items where the <c>Selectable</c> property is <c>true</c>.
		/// Handles and logs DynamoDB-specific and general exceptions, wrapping general exceptions in a <see cref="DynamoDBException"/>.
		/// </summary>
		/// <returns>
		/// A task that represents the asynchronous operation. The task result contains a list of <see cref="Definitions.Program"/> objects
		/// where <c>Selectable</c> is <c>true</c>.
		/// </returns>
		/// <exception cref="DynamoDBException">
		/// Thrown when a DynamoDB-specific error occurs or when a general exception is caught during execution.
		/// </exception>
		public static async Task<List<Definitions.Program>> GetSelectableProgramList()
		{
			try
			{
				List<Definitions.Program> returnValue = [];
				await Common.ValidateTable<Definitions.Program>();

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

				do
				{
					List<Definitions.Program> tempItems = await scanResult.GetNextSetAsync();
					returnValue.AddRange(tempItems);
				} while (!scanResult.IsDone);

				return returnValue;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(3, $"Generic exception received: {ex.Message}");
			}
		}
	}
}
