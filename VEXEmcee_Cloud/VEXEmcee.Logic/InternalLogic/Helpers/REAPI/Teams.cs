namespace VEXEmcee.Logic.InternalLogic.Helpers.REAPI
{
	internal static class Teams
	{
		internal static async Task<List<RE.Objects.Event>> GetEventsByTeamID(int teamID, int seasonID, int pageSize = 25)
		{
			List<RE.Objects.Event> eventList = [];
			bool hasMore = true;
			RE.API.Requests.Teams.EventsAttended request = new()
			{
				ID = teamID,
				Season = [seasonID],
				PageSize = pageSize,
				Page = 1
			};
			do
			{
				RE.Objects.PaginatedEvent response = await RE.API.Teams.EventsAttended(request);
				if (response == null || response.Data == null || response.Data.Count == 0)
				{
					hasMore = false;
				}
				else
				{
					eventList.AddRange(response.Data);
					request.Page++;
					hasMore = response.Meta?.Last_Page >= request.Page;
				}
			} while (hasMore);
			return eventList;
		}

		internal static async Task<List<RE.Objects.Team>> GetTeamsAtEvent(int eventID, int pageSize = 25)
		{
			List<RE.Objects.Team> teamList = [];
			bool hasMore = true;
			RE.API.Requests.Events.TeamsPresent request = new()
			{
				ID = eventID,
				PageSize = pageSize,
				Page = 1
			};
			do
			{
				RE.Objects.PaginatedTeam response = await RE.API.Events.TeamsPresent(request);
				if (response == null || response.Data == null || response.Data.Count == 0)
				{
					hasMore = false;
				}
				else
				{
					teamList.AddRange(response.Data);
					request.Page++;
					hasMore = response.Meta?.Last_Page >= request.Page;
				}
			} while (hasMore);
			return teamList;
		}
	}
}
