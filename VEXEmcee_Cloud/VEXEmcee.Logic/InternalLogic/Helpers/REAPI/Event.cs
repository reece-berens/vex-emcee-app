namespace VEXEmcee.Logic.InternalLogic.Helpers.REAPI
{
	internal static class Event
	{
		internal static async Task<List<RE.Objects.Award>> GetAwardsAtEvent(int eventID, int pageSize = 25)
		{
			List<RE.Objects.Award> awardList = [];
			bool hasMore = true;
			RE.API.Requests.Events.Awards request = new()
			{
				ID = eventID,
				PageSize = pageSize,
				Page = 1
			};
			do
			{
				RE.Objects.PaginatedAward response = await RE.API.Events.Awards(request);
				if (response == null || response.Data == null || response.Data.Count == 0)
				{
					hasMore = false;
				}
				else
				{
					awardList.AddRange(response.Data);
					request.Page++;
					hasMore = response.Meta?.Last_Page >= request.Page;
				}
			} while (hasMore);
			return awardList;
		}

		internal static async Task<List<RE.Objects.MatchObj>> GetMatchesAtEventDivision(int eventID, int divisionID, int pageSize = 25)
		{
			List<RE.Objects.MatchObj> matchList = [];
			bool hasMore = true;
			RE.API.Requests.Events.DivisionMatches request = new()
			{
				ID = eventID,
				DivisionID = divisionID,
				PageSize = pageSize,
				Page = 1
			};
			do
			{
				RE.Objects.PaginatedMatch response = await RE.API.Events.DivisionMatches(request);
				if (response == null || response.Data == null || response.Data.Count == 0)
				{
					hasMore = false;
				}
				else
				{
					matchList.AddRange(response.Data);
					request.Page++;
					hasMore = response.Meta?.Last_Page >= request.Page;
				}
			} while (hasMore);
			return matchList;
		}

		internal static async Task<List<RE.Objects.Ranking>> GetRankingsAtEventDivision(int eventID, int divisionID, int pageSize = 25)
		{
			List<RE.Objects.Ranking> matchList = [];
			bool hasMore = true;
			RE.API.Requests.Events.DivisionRanking request = new()
			{
				ID = eventID,
				DivisionID = divisionID,
				PageSize = pageSize,
				Page = 1
			};
			do
			{
				RE.Objects.PaginatedRanking response = await RE.API.Events.DivisionRankings(request);
				if (response == null || response.Data == null || response.Data.Count == 0)
				{
					hasMore = false;
				}
				else
				{
					matchList.AddRange(response.Data);
					request.Page++;
					hasMore = response.Meta?.Last_Page >= request.Page;
				}
			} while (hasMore);
			return matchList;
		}

		internal static async Task<List<RE.Objects.Skill>> GetSkillsAtEvent(int eventID, int pageSize = 25)
		{
			List<RE.Objects.Skill> skillList = [];
			bool hasMore = true;
			RE.API.Requests.Events.Skills request = new()
			{
				ID = eventID,
				PageSize = pageSize,
				Page = 1
			};
			do
			{
				RE.Objects.PaginatedSkill response = await RE.API.Events.Skills(request);
				if (response == null || response.Data == null || response.Data.Count == 0)
				{
					hasMore = false;
				}
				else
				{
					skillList.AddRange(response.Data);
					request.Page++;
					hasMore = response.Meta?.Last_Page >= request.Page;
				}
			} while (hasMore);
			return skillList;
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
