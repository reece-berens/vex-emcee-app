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
							{":active", new Amazon.DynamoDBv2.DocumentModel.Primitive("1", true) }, //C# object model converts booleans to 0 or 1 numbers
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

		/// <summary>
		/// Saves the specified season object to the DynamoDB table.
		/// </summary>
		/// <remarks>This method validates the DynamoDB table before attempting to save the season object. If an
		/// exception occurs during the save operation, it is logged and rethrown.</remarks>
		/// <param name="season">The season object to be saved. Cannot be null.</param>
		/// <exception cref="DynamoDBException">Thrown if an error occurs while interacting with DynamoDB.</exception>
		public static async Task SaveSeason(Definitions.Season season)
		{
			try
			{
				await Common.ValidateTable<Definitions.Season>();
				await Dynamo.Context.SaveAsync(season);
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(7, $"Generic exception received: {ex.Message}");
			}
		}
	}
}
