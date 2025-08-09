using VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.Data.Stats;

namespace VEXEmcee.Logic.InternalLogic.BuildEventStats.V5RC
{
	internal class Event
	{
		internal static async Task Process(References refs)
		{
			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.V5RC.Event.Process: BEGIN");
			//Get list of teams, save to Teams_denorm, make sure they exist in TeamStats_Season and TeamStats_CurrentEvent tables
			List<RE.Objects.Team> teamsAtEvent = await Helpers.REAPI.Event.GetTeamsAtEvent(refs.Event.ID);
			foreach (RE.Objects.Team team in teamsAtEvent)
			{
				if (!refs.Event.Teams_denorm.Contains(team.Id))
				{
					refs.Event.Teams_denorm.Add(team.Id);
				}
				if (!refs.Update_TeamStats_Season.TryGetValue(TeamStats_Season.GetCompositeKey(refs.Event.SeasonID, team.Id), out TeamStats_Season teamStats_Season))
				{
					teamStats_Season = await DB.Dynamo.Accessors.TeamStats_Season.GetByCompositeKey(refs.Event.SeasonID, team.Id);
					teamStats_Season ??= Helpers.TeamStats_Season.CreateNew(refs.Event.SeasonID, team.Id);
					refs.Update_TeamStats_Season.Add(teamStats_Season.CompositeKey, teamStats_Season);
				}
				if (!refs.Update_TeamStats_CurrentEvent.TryGetValue(TeamStats_CurrentEvent.GetCompositeKey(refs.Event.ID, team.Id), out TeamStats_CurrentEvent teamStats_CurrentEvent))
				{
					teamStats_CurrentEvent = await DB.Dynamo.Accessors.TeamStats_CurrentEvent.GetByCompositeKey(refs.Event.ID, team.Id);
					teamStats_CurrentEvent ??= Helpers.TeamStats_CurrentEvent.CreateNew(refs.Event.ID, team.Id);
					refs.Update_TeamStats_CurrentEvent.Add(teamStats_CurrentEvent.CompositeKey, teamStats_CurrentEvent);
				}
			}

			//only get skills and award results if the event is finalized
			if (refs.Event.Finalized)
			{
				//Get list of skills, save to TeamStats_Season table, do the TeamStats_CurrentEvent table later
				List<RE.Objects.Skill> skillsAtEvent = await Helpers.REAPI.Event.GetSkillsAtEvent(refs.Event.ID);
				foreach (RE.Objects.Skill skill in skillsAtEvent)
				{
					if (!refs.Update_TeamStats_Season.TryGetValue(TeamStats_Season.GetCompositeKey(refs.Event.SeasonID, skill.Team.Id), out TeamStats_Season teamStats_Season))
					{
						//just in case for some weird reason the team has skills but doesn't exist in the list above
						teamStats_Season = await DB.Dynamo.Accessors.TeamStats_Season.GetByCompositeKey(refs.Event.SeasonID, skill.Team.Id);
						teamStats_Season ??= Helpers.TeamStats_Season.CreateNew(refs.Event.SeasonID, skill.Team.Id);
						refs.Update_TeamStats_Season.Add(teamStats_Season.CompositeKey, teamStats_Season);
					}
					if (!teamStats_Season.EventsIncluded.Contains(refs.Event.ID))
					{
						//only load skills for current event if the event hasn't been included in season stats yet
						if (!teamStats_Season.Stats.Skills.TryGetValue(skill.Type.ToString(), out VEXEmcee.Objects.Data.Stats.SkillType skills))
						{
							skills = new()
							{
								AttemptList = [],
								SeasonAttempts = 0,
								SeasonHighScore = 0,
							};
							teamStats_Season.Stats.Skills.Add(skill.Type.ToString(), skills);
						}
						//now that we have the appropriate object, add the results from this event
						skills.SeasonAttempts += skill.Attempts;
						if (skill.Score > skills.SeasonHighScore)
						{
							skills.SeasonHighScore = skill.Score;
						}
						SkillAttempt thisEventAttempt = new()
						{
							Attempts = skill.Attempts,
							HighScore = skill.Score,
						};
						skills.AttemptList.TryAdd(refs.Event.ID, thisEventAttempt);
					}
				}

				//Get list of awards, save to TeamStats_Season table
				List<RE.Objects.Award> awardsAtEvent = await Helpers.REAPI.Event.GetAwardsAtEvent(refs.Event.ID);
				foreach (RE.Objects.Award award in awardsAtEvent)
				{
					//the award can be given to multiple teams, so we need to loop through each team
					if (award.TeamWinners != null) //don't care about the award if not for teams
					{
						foreach (RE.Objects.TeamAwardWinner team in award.TeamWinners)
						{
							if (!refs.Update_TeamStats_Season.TryGetValue(TeamStats_Season.GetCompositeKey(refs.Event.SeasonID, team.Team.Id), out TeamStats_Season teamStats_Season))
							{
								//just in case for some weird reason the team has awards but doesn't exist in the list above
								teamStats_Season = await DB.Dynamo.Accessors.TeamStats_Season.GetByCompositeKey(refs.Event.SeasonID, team.Team.Id);
								teamStats_Season ??= Helpers.TeamStats_Season.CreateNew(refs.Event.SeasonID, team.Team.Id);
								refs.Update_TeamStats_Season.Add(teamStats_Season.CompositeKey, teamStats_Season);
							}
							if (!teamStats_Season.EventsIncluded.Contains(refs.Event.ID))
							{
								//only load awards for current event if the event hasn't been included in season stats yet
								VEXEmcee.Objects.Data.Stats.Award dbAward = new()
								{
									EventID = refs.Event.ID,
									EventName_denorm = refs.Event.Name,
									AwardName = award.Title,
									Qualifications = [.. award.Qualifications],
								};
								dbAward.OtherTeamWinners = [.. award.TeamWinners.Where(t => t.Team.Id != team.Team.Id).Select(t => new TeamRef() { ID = t.Team.Id, Number = t.Team.Name })];
								teamStats_Season.Stats.Awards.Add(dbAward);
							}
						}
					}
				}
			}

			Console.WriteLine($"VEmcee.Logic.Internal.BuildEventStats.V5RC.Event.Process: END");
		}
	}
}
