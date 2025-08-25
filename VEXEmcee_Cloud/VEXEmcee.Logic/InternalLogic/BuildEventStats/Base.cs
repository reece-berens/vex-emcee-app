using VEXEmcee.Objects.Lambda;

namespace VEXEmcee.Logic.InternalLogic.BuildEventStats
{
	internal static class Base
	{
		internal static async Task<bool> BuildEventStats(BuildEventStatsRequest request)
		{
			Console.WriteLine(DateTime.Now.ToLongTimeString());
			int thisProgramID = 0;
			bool returnValue = false;
			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.Base.BuildEventStats: BEGIN - {request.EventID}");
			Dictionary<int, bool> visitedEvents = [];
			Queue<BuildEventStatsRequest> eventQueue = new();
			Dictionary<int, bool> teamsWithEventsLoaded = [];
			eventQueue.Enqueue(request);
			visitedEvents.Add(request.EventID, false);
			while (eventQueue.Count > 0)
			{
				BuildEventStatsRequest currentEventRequest = eventQueue.Dequeue();
				Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.Base.BuildEventStats: Processing event {currentEventRequest.EventID}");
				if (visitedEvents.TryGetValue(currentEventRequest.EventID, out bool value) && value)
				{
					Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.Base.BuildEventStats: Event {currentEventRequest.EventID} already processed, skipping.");
				}
				else
				{
					DB.Dynamo.Definitions.Event thisEvent = await Helpers.Event.GetByEventID(currentEventRequest.EventID, true, true);
					if (thisEvent.ID == request.EventID)
					{
						thisProgramID = thisEvent.ProgramID_denorm;
					}

					//at this point, the event is loaded and we can proceed with building the stats
					if (thisEvent.StatsRequested && !thisEvent.StatsReady)
					{
						Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.Base.BuildEventStats: Building stats for event");
						switch (thisEvent.ProgramID_denorm)
						{
							case 1:
								//V5RC
								await V5RC.Base.BuildStats(thisEvent, currentEventRequest.UserRequestedEvent, eventQueue, teamsWithEventsLoaded);
								break;
							default:
								Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.Base.BuildEventStats: Program ID {thisEvent.ProgramID_denorm} not supported for stats building.");
								thisEvent.StatsReady = true;
								thisEvent.StatsRequested = true;
								await DB.Dynamo.Accessors.Event.SaveEvent(thisEvent);
								break;
						}
					}
					if (!visitedEvents.TryAdd(currentEventRequest.EventID, true))
					{
						visitedEvents[currentEventRequest.EventID] = true; //in case it was already added
					}
				}
			}
			Console.WriteLine("Starting the Compiled stats after list of all things");
			Console.WriteLine(DateTime.Now.ToLongTimeString());
			//done processing all events in the queue, now build the current event stats once all season stats are built
			switch (thisProgramID)
			{
				case 1:
					//V5RC
					await V5RC.Base.InitializeCompiledStats(request.EventID);
					break;
				default:
					break;
			}

			//at this point, the event stats are ready
			DB.Dynamo.Definitions.Event thisEventStatsReady = await Helpers.Event.GetByEventID(request.EventID, false, false);
			thisEventStatsReady.StatsReady = true;
			await DB.Dynamo.Accessors.Event.SaveEvent(thisEventStatsReady);
			Console.WriteLine(DateTime.Now.ToLongTimeString());
			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.Base.BuildEventStats: END - {request.EventID}");
			return returnValue;
		}

		internal static async Task ValidateCurrentEventStats(int eventID)
		{
			DB.Dynamo.Definitions.Event thisEvent = await Helpers.Event.GetByEventID(eventID, false, false);
			//only run current event stats validation if the event is not finalized
			if (!thisEvent.Finalized)
			{
				DateTime now = DateTime.UtcNow;
				if (thisEvent.LastCurrentStatsCheck == null || now > thisEvent.LastCurrentStatsCheck.Value.AddSeconds(90))
				{
					//we need to update the matches, rankings, and skills results for every division in this event
					switch (thisEvent.ProgramID_denorm)
					{
						case 1:
							//V5RC
							await V5RC.Base.ValidateCurrentEventStats(thisEvent);
							break;
						default:
							break;
					}
					thisEvent.LastCurrentStatsCheck = DateTime.UtcNow;
					await DB.Dynamo.Accessors.Event.SaveEvent(thisEvent);
				}
			}
		}
	}
}
