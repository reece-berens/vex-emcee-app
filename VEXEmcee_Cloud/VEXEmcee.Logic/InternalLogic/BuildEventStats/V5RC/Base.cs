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
					if (teamStats_Season.Stats.Skills.TryGetValue(RE.Objects.SkillType.driver.ToString(), out Objects.Data.Stats.SkillType driverSkills))
					{
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.driver.ToString()].SeasonHighScore = driverSkills.SeasonHighScore;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.driver.ToString()].SeasonAttempts = driverSkills.SeasonAttempts;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.driver.ToString()].SeasonHighScoreThisEvent = false;
					}
					if (teamStats_Season.Stats.Skills.TryGetValue(RE.Objects.SkillType.programming.ToString(), out Objects.Data.Stats.SkillType progSkills))
					{
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.programming.ToString()].SeasonHighScore = progSkills.SeasonHighScore;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.programming.ToString()].SeasonAttempts = progSkills.SeasonAttempts;
						teamStats_CurrentEvent.CompiledStats.Skills[RE.Objects.SkillType.programming.ToString()].SeasonHighScoreThisEvent = false;
					}
				}
				await DB.Dynamo.Accessors.TeamStats_CurrentEvent.Save(teamStats_CurrentEvent);
			}
		}

		internal static async Task ValidateCurrentEventStats(DB.Dynamo.Definitions.Event thisEvent)
		{
			//only validate current event stats if the stats for the event are ready
			if (thisEvent.StatsReady)
			{
				//Load in all TeamStats_CurrentEvent and TeamStats_Season objects for this event
				List<DB.Dynamo.Definitions.TeamStats_CurrentEvent> teamStats_CurrentEvents = await DB.Dynamo.Accessors.TeamStats_CurrentEvent.GetByEventID(thisEvent.ID);
				Dictionary<string, int> teamStatsSeasonKeys = [];
				foreach (int teamID in thisEvent.Teams_denorm)
				{
					teamStatsSeasonKeys.Add(DB.Dynamo.Definitions.TeamStats_Season.GetCompositeKey(thisEvent.SeasonID, teamID), teamID);
				}
				List<DB.Dynamo.Definitions.TeamStats_Season> teamStats_Season = await DB.Dynamo.Accessors.TeamStats_Season.GetByCompositeKeys(teamStatsSeasonKeys);
				List<DB.Dynamo.Definitions.LiveMatch> eventLiveMatches_current = await DB.Dynamo.Accessors.LiveMatch.GetByEventID(thisEvent.ID);
				List<DB.Dynamo.Definitions.LiveMatch> eventLiveMatches_update = [];

				//potentially check RE API for any new divisions that may have been added since the last time the event was processed??
				RE.Objects.Event reEvent = await RE.API.Events.Single(new() { ID = thisEvent.ID });
				if (reEvent != null)
				{
					foreach (RE.Objects.Division division in reEvent.Divisions ?? [])
					{
						if (!thisEvent.DivisionNames.ContainsKey(division.Id))
						{
							thisEvent.DivisionNames.Add(division.Id, division.Name);
							thisEvent.DivisionTeams.Add(division.Id, []);
						}
					}

					//if the event has been finalized, update the flag but still run the stats validation so that the stats are accurate before not running this process again
					thisEvent.Finalized = reEvent.AwardsFinalized;
				}

				await Event.UpdateLiveEventSkills(thisEvent, teamStats_Season, teamStats_CurrentEvents);

				//reset all stats so that they can be rebuilt from scratch (do this before processing divisions in case one team is in multiple divisions (div quali/elim, then tournament finals)
				foreach (VEXEmcee.DB.Dynamo.Definitions.TeamStats_CurrentEvent teamStats_CurrentEvent in teamStats_CurrentEvents)
				{
					Helpers.TeamStats_CurrentEvent.ResetEventMatchStats(teamStats_CurrentEvent, teamStats_Season.FirstOrDefault(x => x.TeamID == teamStats_CurrentEvent.TeamID));
				}

				foreach (int divisionID in thisEvent.DivisionNames.Keys)
				{
					await EventDivision.UpdateRankings(thisEvent, divisionID, teamStats_Season, teamStats_CurrentEvents);

					await EventDivision.UpdateMatches(thisEvent, divisionID, teamStats_Season, teamStats_CurrentEvents, eventLiveMatches_current, eventLiveMatches_update);
				}

				foreach (DB.Dynamo.Definitions.LiveMatch match in eventLiveMatches_update)
				{
					await DB.Dynamo.Accessors.LiveMatch.SaveMatch(match);
				}

				//count up win %, PF/PA averages at this point once all matches are processed
				foreach (DB.Dynamo.Definitions.TeamStats_CurrentEvent teamEventStats in teamStats_CurrentEvents)
				{
					List<DenormData> dataToUpdate = [teamEventStats.EventStats.DenormData, teamEventStats.CompiledStats.DenormData];
					foreach (DenormData data in dataToUpdate)
					{
						data.AllMatches.MatchCount = data.QualiMatches.MatchCount + data.ElimMatches.MatchCount;
						data.AllMatches.WinPercentage = (data.AllMatches.Win + (0.5 * data.AllMatches.Tie)) / ((double)Math.Max(1, data.AllMatches.MatchCount));
						data.AllMatches.PointsForAvg = data.AllMatches.PointsForTotal / (double)Math.Max(1, data.AllMatches.MatchCount);
						data.AllMatches.PointsAgainstAvg = data.AllMatches.PointsAgainstTotal / (double)Math.Max(1, data.AllMatches.MatchCount);

						data.QualiMatches.WinPercentage = (data.QualiMatches.Win + (0.5 * data.QualiMatches.Tie)) / ((double)Math.Max(1, data.QualiMatches.MatchCount));
						data.QualiMatches.PointsForAvg = data.QualiMatches.PointsForTotal / (double)Math.Max(1, data.QualiMatches.MatchCount);
						data.QualiMatches.PointsAgainstAvg = data.QualiMatches.PointsAgainstTotal / (double)Math.Max(1, data.QualiMatches.MatchCount);
						data.QualiMatches.WPAvg = data.QualiMatches.WPTotal / (double)Math.Max(1, data.QualiMatches.MatchCount);
						data.QualiMatches.APAvg = data.QualiMatches.APTotal / (double)Math.Max(1, data.QualiMatches.MatchCount);
						data.QualiMatches.SPAvg = data.QualiMatches.SPTotal / (double)Math.Max(1, data.QualiMatches.MatchCount);

						data.ElimMatches.WinPercentage = (data.ElimMatches.Win + (0.5 * data.ElimMatches.Tie)) / ((double)Math.Max(1, data.ElimMatches.MatchCount));
						data.ElimMatches.PointsForAvg = data.ElimMatches.PointsForTotal / (double)Math.Max(1, data.ElimMatches.MatchCount);
						data.ElimMatches.PointsAgainstAvg = data.ElimMatches.PointsAgainstTotal / (double)Math.Max(1, data.ElimMatches.MatchCount);
					}

					//now that all stats are updated, save the current event stats
					await DB.Dynamo.Accessors.TeamStats_CurrentEvent.Save(teamEventStats);
				}
			}
		}
	}
}
