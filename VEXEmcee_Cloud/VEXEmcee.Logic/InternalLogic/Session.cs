using System.Reflection;
using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using VEXEmcee.Objects.Exceptions;
using Amazon.EventBridge;
using Amazon.Lambda;
using VEXEmcee.Objects.Lambda;
using Amazon.Lambda.Model;
using Amazon.EventBridge.Model;
using System.Text.Json;
using Amazon.Scheduler;
using Amazon.Scheduler.Model;

namespace VEXEmcee.Logic.InternalLogic
{
	internal static class Session
	{
		internal static AmazonEventBridgeClient eventBridgeClient = new(Amazon.RegionEndpoint.USEast1);
		internal static AmazonLambdaClient lambdaClient = new(Amazon.RegionEndpoint.USEast1);
		internal static AmazonSchedulerClient schedulerClient = new(Amazon.RegionEndpoint.USEast1);

		/// <summary>
		/// Retrieves a session from the database using the provided session ID.
		/// Handles DynamoDB-specific exceptions by logging them and returns null if an error occurs.
		/// </summary>
		/// <param name="sessionID">The unique identifier of the session to retrieve.</param>
		/// <returns>
		/// The <see cref="Definitions.Session"/> object if found; otherwise, <c>null</c> if an error occurs or the session does not exist.
		/// </returns>
		internal static async Task<Definitions.Session> GetSession(string sessionID)
		{
			try
			{
				Definitions.Session session = await Accessors.Session.GetSessionByID(sessionID);
				return session;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				return null;
			}
		}

		/// <summary>
		/// Registers a new session by generating a unique session ID and storing it in the database.
		/// Checks for existing sessions with the same ID to avoid collisions, and handles exceptions related to DynamoDB and general errors.
		/// </summary>
		/// <param name="request">The <see cref="RegisterNewSessionRequest"/> containing any data needed to register a session.</param>
		/// <returns>
		/// The unique session ID as a <see cref="string"/> if registration is successful; otherwise, <c>null</c> if an error occurs or a collision is detected.
		/// </returns>
		internal static async Task<string> RegisterNewSession(RegisterNewSessionRequest request)
		{
			/*
				At some point, I may add some logic in here to ensure there aren't too many sessions registered from the same IP address/location
				For the moment, just allow any session to be registered without any restrictions
			*/

			try
			{
				string sessionID = request.Session; //Guid.NewGuid().ToString();
				Definitions.Session existingSession = await Accessors.Session.GetSessionByID(sessionID);
				if (existingSession == null)
				{
					//session does not exist, which is good
					existingSession = await Accessors.Session.RegisterNewSession(sessionID);
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

		/// <summary>
		/// Registers a specified event and division with a session.
		/// </summary>
		/// <remarks>This method validates the existence of the session, event, and division before proceeding. If the
		/// event has already concluded or the specified division does not exist within the event, the registration will fail.
		/// Additionally, if the event is not already stored in the system, it will be created and saved based on the
		/// retrieved data. A lambda function will be invoked if stats need to be loaded for the selected event.</remarks>
		/// <param cref="RegisterSessionEventDivisionRequest" name="request">The request containing the session ID, event ID, and division ID to register.</param>
		/// <returns>A <see cref="RegisterSessionEventDivisionResponse"/> indicating the success or failure of the operation. If
		/// successful, the session is updated with the specified event and division. If unsuccessful, the response contains
		/// an error message and an appropriate HTTP status code.</returns>
		internal static async Task<RegisterSessionEventDivisionResponse> RegisterSessionEventDivision(RegisterSessionEventDivisionRequest request)
		{
			Definitions.Session session = await Accessors.Session.GetSessionByID(request.Session);
			if (session == null)
			{
				//the session is not registered, return an error response
				return new()
				{
					ErrorMessage = "The specified session does not exist.",
					StatusCode = System.Net.HttpStatusCode.NotFound,
					Success = false,
				};
			}
			else
			{
				//call the RE API to ensure the selected event and division are valid before proceeding
				RE.API.Requests.IDBase reEventRequest = new()
				{
					ID = request.EventID,
				};
				RE.Objects.Event reEvent = await RE.API.Events.Single(reEventRequest);
				if (reEvent == null)
				{
					//the event does not exist, return an error response
					return new()
					{
						ErrorMessage = "The specified event does not exist.",
						StatusCode = System.Net.HttpStatusCode.BadRequest,
						Success = false,
					};
				}
				else if (reEvent.Divisions == null || !reEvent.Divisions.Exists(x => x.Id == request.DivisionID))
				{
					//the division does not exist for the event, return an error response
					return new()
					{
						ErrorMessage = "The specified division does not exist at the event.",
						StatusCode = System.Net.HttpStatusCode.BadRequest,
						Success = false,
					};
				}
				else if (reEvent.AwardsFinalized)
				{
					//the event is over, cannot register a new session for it, return an error response
					return new()
					{
						ErrorMessage = "The specified event has already concluded and a new session cannot be registered for it.",
						StatusCode = System.Net.HttpStatusCode.BadRequest,
						Success = false,
					};
				}
				else
				{
					session.SelectedDivisionID = request.DivisionID;
					session.SelectedEventID = request.EventID;
					session.ShownSimpleStat = [];
					await Accessors.Session.SaveSession(session);

					Definitions.Event ev = await Accessors.Event.GetEventByID(request.EventID);
					if (ev == null)
					{
						//the event doesn't exist in the table, create an object and save it with the information from RE API retrieved above
						Definitions.Event eventToSave = Helpers.Event.ConvertREEventToDBEvent(reEvent);
						eventToSave.StatsRequested = eventToSave.ID == request.EventID;
						await Accessors.Event.SaveEvent(eventToSave);

						//run the lambda function to gather information about the event
						await CreateStatsRecurringTask(eventToSave);
					}
					else if (!ev.StatsRequested && !ev.StatsReady)
					{
						//we have not yet requested stats for this event, and they are not ready, update the flag to request stats and save the event
						ev.StatsRequested = true;
						await Accessors.Event.SaveEvent(ev);
						await CreateStatsRecurringTask(ev);
					}

					return new()
					{
						Success = true,
						StatusCode = System.Net.HttpStatusCode.OK,
					};
				}
			}
		}

		internal static async Task CreateStatsRecurringTask(Definitions.Event eventForTask)
		{
			//run the lambda function to gather information about the event
			try
			{
				BuildEventStatsRequest buildStatsRequest = new()
				{
					EventID = eventForTask.ID,
					UserRequestedEvent = true,
				};
				Amazon.Lambda.Model.InvokeRequest invokeRequest = new()
				{
					FunctionName = "BuildEventStats",
					Payload = System.Text.Json.JsonSerializer.Serialize(buildStatsRequest),
					InvocationType = InvocationType.Event
				};
				Amazon.Lambda.Model.InvokeResponse invokeResponse = await lambdaClient.InvokeAsync(invokeRequest);

				GetFunctionResponse getFn = await lambdaClient.GetFunctionAsync(new GetFunctionRequest { FunctionName = "ValidateCurrentEventStats" });
				string lambdaArn = getFn.Configuration.FunctionArn;

				// Build schedule name (make unique)
				DateTime startUtc = DateTime.UtcNow;
				string scheduleName = $"ValidateCurrentEventStats_Event_{eventForTask.ID}";
				DateTime endUtc = startUtc.AddHours(12);
				CreateScheduleRequest scheduleRequest = new()
				{
					Name = scheduleName,
					ScheduleExpression = "rate(2 minutes)",
					ScheduleExpressionTimezone = "UTC",
					StartDate = startUtc,
					EndDate = endUtc,
					FlexibleTimeWindow = new()
					{
						Mode = FlexibleTimeWindowMode.FLEXIBLE,
						MaximumWindowInMinutes = 5
					},
					Target = new()
					{
						Arn = lambdaArn,
						RoleArn = System.Environment.GetEnvironmentVariable("EventBridgeSchedulerRoleARN"),
						Input = JsonSerializer.Serialize(new ValidateCurrentEventStatsRequest() { EventID = eventForTask.ID })
					}
				};
				CreateScheduleResponse scheduledResponse = await schedulerClient.CreateScheduleAsync(scheduleRequest);
			}
			catch (Exception e)
			{
				Console.WriteLine($"Exception invoking BuildEventStats lambda: {e.Message}");
				Console.WriteLine(e.StackTrace);
				throw;
			}
		}
	}
}
