namespace VEXEmcee.Logic.InternalLogic.Helpers
{
	internal class TeamStats_CurrentEvent
	{
		internal static DB.Dynamo.Definitions.TeamStats_CurrentEvent CreateNew(int eventID, int teamID)
		{
			return new DB.Dynamo.Definitions.TeamStats_CurrentEvent
			{
				EventID = eventID,
				TeamID = teamID,
				CompiledStats = new(),
				EventStats = new(),
			};
		}

		internal static void ResetEventMatchStats(DB.Dynamo.Definitions.TeamStats_CurrentEvent teamStats_CurrentEvent, DB.Dynamo.Definitions.TeamStats_Season teamStats_Season)
		{
			teamStats_CurrentEvent.EventStats.DenormData.AllMatches = new();
			teamStats_CurrentEvent.EventStats.DenormData.QualiMatches = new();
			teamStats_CurrentEvent.EventStats.DenormData.ElimMatches = new();

			teamStats_CurrentEvent.CompiledStats.DenormData.AllMatches = new(teamStats_Season.Stats.DenormData.AllMatches);
			teamStats_CurrentEvent.CompiledStats.DenormData.QualiMatches = new(teamStats_Season.Stats.DenormData.QualiMatches);
			teamStats_CurrentEvent.CompiledStats.DenormData.ElimMatches = new(teamStats_Season.Stats.DenormData.ElimMatches);
		}
	}
}
