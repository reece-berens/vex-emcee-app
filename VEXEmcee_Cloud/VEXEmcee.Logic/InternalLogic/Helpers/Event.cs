using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.Logic.InternalLogic.Helpers
{
	internal static class Event
	{
		internal static DB.Dynamo.Definitions.Event ConvertREEventToDBEvent(RE.Objects.Event reEvent)
		{
			if (reEvent == null)
			{
				throw new ArgumentNullException(nameof(reEvent), "The RE event cannot be null.");
			}
			DB.Dynamo.Definitions.Event dbEvent = new()
			{
				ID = reEvent.Id,
				Name = reEvent.Name,
				SKU = reEvent.Sku,
				SeasonID = reEvent.Season?.Id ?? 0,
				ProgramID_denorm = reEvent.Program?.Id ?? 0,
				StartDate = reEvent.Start,
				EndDate = reEvent.End,
				Finalized = reEvent.AwardsFinalized,
				Level = reEvent.Level,
				Type = reEvent.EventType,
				LevelString = reEvent.Level.ToString(),
				TypeString = reEvent.EventType.ToString(),
				StatsReady = false,
				StatsRequested = false,
				Teams_denorm = [],
				DivisionTeams = [],
			};
			if (reEvent.Divisions == null)
			{
				dbEvent.DivisionNames = [];
			}
			else
			{
				dbEvent.DivisionNames = reEvent.Divisions.ToDictionary(x => x.Id, x => x.Name);
			}
			return dbEvent;
		}

		internal static async Task<DB.Dynamo.Definitions.Event> GetByEventID(int eventID, bool requestStatsIfCreated, bool checkIfFinalized = false)
		{
			DB.Dynamo.Definitions.Event thisEvent = await DB.Dynamo.Accessors.Event.GetEventByID(eventID);
			
			if (thisEvent == null)
			{
				RE.Objects.Event reEvent = await RE.API.Events.Single(new() { ID = eventID });
				//event doesn't exist, load from RE API
				if (reEvent == null)
				{
					Console.WriteLine($"VEmcee.Logic.Internal.Helpers.Event.GetByEventID: Event does not exist in RE API. - {eventID}");
					throw new LogicException(5, $"The event does not exist in the database or RE API - {eventID}");
				}
				//need to create new database object
				thisEvent = ConvertREEventToDBEvent(reEvent);
				thisEvent.StatsReady = false;
				thisEvent.StatsRequested = requestStatsIfCreated;
				await DB.Dynamo.Accessors.Event.SaveEvent(thisEvent);
			}
			else if (checkIfFinalized)
			{
				//check if the event has been finalized since being loaded from the server
				RE.Objects.Event reEvent = await RE.API.Events.Single(new() { ID = eventID });
				if (!thisEvent.Finalized && reEvent.AwardsFinalized)
				{
					thisEvent.Finalized = reEvent.AwardsFinalized;
					await DB.Dynamo.Accessors.Event.SaveEvent(thisEvent);
				}
				
			}
			return thisEvent;
		}
	}
}
