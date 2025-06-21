using System.Reflection;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	public static class Event
	{
		/// <summary>
		/// Retrieves an event by its ID from the database.
		/// </summary>
		/// <remarks>This method performs validation on the underlying database table before attempting to retrieve
		/// the event. Ensure that the database connection and table schema are properly configured.</remarks>
		/// <param name="eventID">The ID of the event to retrieve. Must be a valid, non-negative integer.</param>
		/// <returns>A <see cref="Definitions.Event"/> object representing the event with the specified identifier. Returns <see
		/// langword="null"/> if no event with the given identifier exists.</returns>
		/// <exception cref="DynamoDBException">Thrown if an error occurs while accessing the database.</exception>
		public static async Task<Definitions.Event> GetEventByID(int eventID)
		{
			try
			{
				await Common.ValidateTable<Definitions.Event>();
				Definitions.Event ev = await Dynamo.Context.LoadAsync<Definitions.Event>(eventID);
				if (ev != null)
				{
					//manually populate the Level and Type enums
					ev.Level = (ev?.LevelString) switch
					{
						"Signature" => RE.Objects.EventLevel.Signature,
						"Regional" => RE.Objects.EventLevel.Regional,
						"State" => RE.Objects.EventLevel.State,
						"National" => RE.Objects.EventLevel.National,
						"World" => RE.Objects.EventLevel.World,
						_ => RE.Objects.EventLevel.Other,
					};
					ev.Type = (ev?.TypeString) switch
					{
						"tournament" => RE.Objects.EventType.tournament,
						"league" => RE.Objects.EventType.league,
						"workshop" => RE.Objects.EventType.workshop,
						"Virtual" => RE.Objects.EventType.Virtual,
						_ => RE.Objects.EventType.tournament,
					};
				}
				return ev;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(10, $"Generic exception received: {ex.Message}");
			}
		}

		/// <summary>
		/// Saves the specified event to the database asynchronously.
		/// </summary>
		/// <remarks>This method validates the database table before saving the event. It ensures that the  <see
		/// cref="Definitions.Event.LevelString"/> and <see cref="Definitions.Event.TypeString"/>  properties are set based on
		/// the corresponding <see cref="Definitions.Event.Level"/> and  <see cref="Definitions.Event.Type"/>
		/// values.</remarks>
		/// <param name="ev">The event to be saved. The event must have its properties properly initialized, including <see
		/// cref="Definitions.Event.Level"/> and <see cref="Definitions.Event.Type"/>.</param>
		/// <returns></returns>
		/// <exception cref="DynamoDBException">Thrown if an error occurs while interacting with the database.</exception>
		public static async Task SaveEvent(Definitions.Event ev)
		{
			try
			{
				await Common.ValidateTable<Definitions.Event>();
				//ensure the LevelString and TypeString properties are set correctly
				ev.LevelString = ev.Level.ToString();
				ev.TypeString = ev.Type.ToString();
				await Dynamo.Context.SaveAsync(ev);
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(11, $"Generic exception received: {ex.Message}");
			}
		}
	}
}
