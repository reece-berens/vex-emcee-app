using VEXEmcee.Objects.Data.Stats;
using VEXEmcee.Objects.Lambda;

namespace VEXEmcee.Logic.InternalLogic.BuildEventStats.V5RC
{
	internal static class Base
	{
		internal static async Task BuildStats(DB.Dynamo.Definitions.Event thisEvent, bool userRequestedEvent, Queue<BuildEventStatsRequest> eventRequestQueue, Dictionary<int, bool> teamsWithEventsLoaded)
		{
			References internalRefs = new()
			{
				Event = thisEvent,
				Update_TeamStats_Season = [],
				Update_TeamStats_CurrentEvent = [],
				UserRequestedEvent = userRequestedEvent
			};
			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.V5RC.Base.BuildStats: BEGIN - {thisEvent.ID}");
			//For each division, get list of teams and matches
			thisEvent.Teams_denorm = [];
			thisEvent.DivisionTeams = [];
			if (thisEvent.DivisionNames == null)
			{
				Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.V5RC.Base.BuildStats: No divisions exist at the tournament, returning out");
			}
			else
			{
				//do work for the event
				await Event.Process(internalRefs);
				//do work by division
				foreach (int divisionID in thisEvent.DivisionNames.Keys)
				{
					await EventDivision.ProcessDivision(internalRefs, divisionID);
				}

				//for each team, add the events they've been to this season to the queue
				if (userRequestedEvent)
				{
					foreach (int teamID in thisEvent.Teams_denorm)
					{
						if (teamsWithEventsLoaded.TryAdd(teamID, true)) //if the team ID doesn't exist, this will return true since it was able to be added - that way we know to queue events
						{
							List<RE.Objects.Event> teamEvents = await Helpers.REAPI.Teams.GetEventsByTeamID(teamID, thisEvent.SeasonID);
							foreach (RE.Objects.Event teamEvent in teamEvents)
							{
								eventRequestQueue.Enqueue(new BuildEventStatsRequest()
								{
									EventID = teamEvent.Id,
									UserRequestedEvent = false //false since this event comes from internal processing, not a user request
								});
							}
						}
					}
				}

				//done processing the event, save the event and all stats
				await DB.Dynamo.Accessors.Event.SaveEvent(thisEvent);
				//only show that stats are loaded for the event if it is finalized
				if (thisEvent.Finalized)
				{
					foreach (DB.Dynamo.Definitions.TeamStats_Season teamStats_Season in internalRefs.Update_TeamStats_Season.Values)
					{
						if (!teamStats_Season.EventsIncluded.Contains(thisEvent.ID))
						{
							teamStats_Season.EventsIncluded.Add(thisEvent.ID);
						}
						await DB.Dynamo.Accessors.TeamStats_Season.Save(teamStats_Season);
					}
				}
				if (userRequestedEvent) //only save current event stats if this was a user-requested event
				{
					foreach (DB.Dynamo.Definitions.TeamStats_CurrentEvent teamStats_CurrentEvent in internalRefs.Update_TeamStats_CurrentEvent.Values)
					{
						await DB.Dynamo.Accessors.TeamStats_CurrentEvent.Save(teamStats_CurrentEvent);
					}
				}
			}
			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.V5RC.Base.BuildStats: End - {thisEvent.ID}");
		}

		internal static async Task InitializeCompiledStats(int eventID)
		{
			DB.Dynamo.Definitions.Event thisEvent = await Helpers.Event.GetByEventID(eventID, false, false);
			foreach (int teamID in thisEvent.Teams_denorm)
			{
				DB.Dynamo.Definitions.TeamStats_CurrentEvent teamStats_CurrentEvent = await DB.Dynamo.Accessors.TeamStats_CurrentEvent.GetByCompositeKey(thisEvent.ID, teamID);
				if (teamStats_CurrentEvent == null) //this shouldn't happen, but just in case
				{
					teamStats_CurrentEvent = Helpers.TeamStats_CurrentEvent.CreateNew(thisEvent.ID, teamID);
					await DB.Dynamo.Accessors.TeamStats_CurrentEvent.Save(teamStats_CurrentEvent);
				}
				DB.Dynamo.Definitions.TeamStats_Season teamStats_Season = await DB.Dynamo.Accessors.TeamStats_Season.GetByCompositeKey(thisEvent.SeasonID, teamID);
				if (teamStats_Season != null)
				{
					teamStats_CurrentEvent.CompiledStats = new()
					{
						DenormData = new(teamStats_Season.Stats.DenormData),
						Skills = []
					};
					teamStats_CurrentEvent.CompiledStats.Skills.Add(RE.Objects.SkillType.driver.ToString(), new());
					teamStats_CurrentEvent.CompiledStats.Skills.Add(RE.Objects.SkillType.programming.ToString(), new());
					if (teamStats_Season.Stats.Skills.TryGetValue(RE.Objects.SkillType.driver.ToString(), out SkillType driverSkills))
					{
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.driver.ToString()].SeasonHighScore = driverSkills.SeasonHighScore;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.driver.ToString()].SeasonAttempts = driverSkills.SeasonAttempts;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.driver.ToString()].SeasonHighScoreToday = false;
					}
					if (teamStats_Season.Stats.Skills.TryGetValue(RE.Objects.SkillType.programming.ToString(), out SkillType progSkills))
					{
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.programming.ToString()].SeasonHighScore = progSkills.SeasonHighScore;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.programming.ToString()].SeasonAttempts = progSkills.SeasonAttempts;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.programming.ToString()].SeasonHighScoreToday = false;
					}
				}
				await DB.Dynamo.Accessors.TeamStats_CurrentEvent.Save(teamStats_CurrentEvent);
			}
		}
	}
}
