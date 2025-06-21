using Amazon.DynamoDBv2.DataModel;
using System.Reflection;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	public static class Season
	{
		/// <summary>
		/// Get all active seasons for a given program ID
		/// </summary>
		/// <param name="programID">Program ID to search by</param>
		/// <returns>Single season that is the active one for the selected program, or null if none is found</returns>
		/// <exception cref="DynamoDBException"></exception>
		public static async Task<Definitions.Season> GetActiveSeasonByProgramID(int programID)
		{
			try
			{
				Definitions.Season returnValue = null;
				await Common.ValidateTable<Definitions.Season>();

				IAsyncSearch<Definitions.Season> scanResult = Dynamo.Context.FromScanAsync<Definitions.Season>(new Amazon.DynamoDBv2.DocumentModel.ScanOperationConfig()
				{
					FilterExpression = new Amazon.DynamoDBv2.DocumentModel.Expression
					{
						ExpressionStatement = "Active = :active AND ProgramID = :programID",
						ExpressionAttributeValues = new Dictionary<string, Amazon.DynamoDBv2.DocumentModel.DynamoDBEntry>()
						{
							{":active", new Amazon.DynamoDBv2.DocumentModel.DynamoDBBool(true) },
							{":programID", new Amazon.DynamoDBv2.DocumentModel.Primitive(programID.ToString(), true) }
						}
					}
				});

				List<Definitions.Season> itemsReturned = await scanResult.GetNextSetAsync();
				if (itemsReturned.Count > 0)
				{
					returnValue = itemsReturned[0]; //just care about the first one, shouldn't be more than one active season per program
				}

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
				throw new DynamoDBException(6, $"Generic exception received: {ex.Message}");
			}
		}
	}
}
