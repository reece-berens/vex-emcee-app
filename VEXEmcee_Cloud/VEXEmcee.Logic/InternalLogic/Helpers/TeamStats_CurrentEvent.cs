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
	}
}
