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

		/// <summary>
		/// Saves the specified program to the database.
		/// </summary>
		/// <remarks>This method validates the database table associated with <see cref="Definitions.Program"/> before
		/// saving the program. If the save operation fails due to a DynamoDB-specific issue, the exception is logged and
		/// rethrown. For other exceptions, a <see cref="DynamoDBException"/> is thrown with additional context.</remarks>
		/// <param name="program">The program object to be saved. This must be a valid instance of <see cref="Definitions.Program"/>.</param>
		/// <exception cref="DynamoDBException">Thrown if a DynamoDB-specific error occurs during the save operation or if a generic exception is encountered.</exception>
		public static async Task SaveProgram(Definitions.Program program)
		{
			try
			{
				await Common.ValidateTable<Definitions.Program>();
				await Dynamo.Context.SaveAsync(program);
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
