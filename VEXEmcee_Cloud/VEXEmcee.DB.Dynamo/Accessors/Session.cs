using System.Reflection;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	public static class Session
	{
		/// <summary>
		/// Retrieves a session from the DynamoDB table by its unique session ID.
		/// Validates the existence of the required table before attempting to load the session.
		/// Handles and logs DynamoDB-specific and generic exceptions.
		/// </summary>
		/// <param name="sessionID">The unique identifier of the session to retrieve.</param>
		/// <returns>The <see cref="Definitions.Session"/> object if found; otherwise, null.</returns>
		/// <exception cref="DynamoDBException">
		/// Thrown when a DynamoDB-specific error occurs or a generic exception is caught during the retrieval process.
		/// </exception>
		public static async Task<Definitions.Session> GetSessionByID(string sessionID)
		{
			try
			{
				await Common.ValidateTable<Definitions.Session>();

				Definitions.Session session = await Dynamo.Context.LoadAsync<Definitions.Session>(sessionID);

				return session;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(5, $"Generic exception received: {ex.Message}");
			}
		}

		/// <summary>
		/// Registers a new session in the DynamoDB table.
		/// Initializes a <see cref="Definitions.Session"/> object with the provided session ID and the current UTC start time.
		/// Validates the existence of the required table and saves the session to DynamoDB.
		/// Handles and logs DynamoDB-specific and generic exceptions.
		/// </summary>
		/// <param name="sessionID">The unique identifier for the session to register.</param>
		/// <returns>The newly created <see cref="Definitions.Session"/> object.</returns>
		/// <exception cref="DynamoDBException">
		/// Thrown when a DynamoDB-specific error occurs or a generic exception is caught during the registration process.
		/// </exception>
		public static async Task<Definitions.Session> RegisterNewSession(string sessionID)
		{
			try
			{
				Definitions.Session session = new()
				{
					ID = sessionID,
					StartDateTime = DateTime.UtcNow,
					ShownSimpleStat = []
				};
				await Common.ValidateTable<Definitions.Session>();

				await Dynamo.Context.SaveAsync(session);

				return session;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(4, $"Generic exception received: {ex.Message}");
			}
		}

		/// <summary>
		/// Saves the specified session object to the database asynchronously.
		/// </summary>
		/// <remarks>This method validates the session table before saving the session object. If an exception occurs
		/// during the save operation, it is logged and rethrown.</remarks>
		/// <param name="session">The session object to be saved. Cannot be null.</param>
		/// <returns>A task that represents the asynchronous save operation.</returns>
		/// <exception cref="DynamoDBException">Thrown if an error occurs while interacting with the database. Thrown if a generic exception occurs during the
		/// save operation.</exception>
		public static async Task SaveSession(Definitions.Session session)
		{
			try
			{
				await Common.ValidateTable<Definitions.Session>();
				await Dynamo.Context.SaveAsync(session);
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(9, $"Generic exception received: {ex.Message}");
			}
		}
	}
}
