using System.Reflection;
using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.Logic.InternalLogic
{
	internal static class Session
	{
		/// <summary>
		/// Registers a new session by generating a unique session ID and storing it in the database.
		/// Checks for existing sessions with the same ID to avoid collisions, and handles exceptions related to DynamoDB and general errors.
		/// </summary>
		/// <param name="request">The <see cref="RegisterSessionRequest"/> containing any data needed to register a session.</param>
		/// <returns>
		/// The unique session ID as a <see cref="string"/> if registration is successful; otherwise, <c>null</c> if an error occurs or a collision is detected.
		/// </returns>
		internal static async Task<string> RegisterSession(RegisterSessionRequest request)
		{
			/*
				At some point, I may add some logic in here to ensure there aren't too many sessions registered from the same IP address/location
				For the moment, just allow any session to be registered without any restrictions
			*/

			try
			{
				string sessionID = Guid.NewGuid().ToString();
				Definitions.Session existingSession = await Accessors.Session.GetSessionByID(sessionID);
				if (existingSession == null)
				{
					//session does not exist, which is good
					existingSession = await Accessors.Session.RegisterSession(sessionID);
					//if we get here, the session was successfully registered, so return the session ID
					return existingSession.ID;
				}
				else
				{
					//session exists for some reason, return an error message
					Console.WriteLine($"{MethodBase.GetCurrentMethod()?.Name} - Session with ID {sessionID} already exists. This should not happen.");
					return null;
				}
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				return null;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				return null;
			}
		}
	}
}
