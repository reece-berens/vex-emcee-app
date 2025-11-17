namespace VEXEmcee.Logic.InternalLogic.BuildEventStats.V5RC
{
	internal class References
	{
		internal DB.Dynamo.Definitions.Event Event { get; set; }
		//key is CompositeKey
		internal Dictionary<string, DB.Dynamo.Definitions.TeamStats_Season> Update_TeamStats_Season { get; set; }
		//key is CompositeKey
		internal Dictionary<string, DB.Dynamo.Definitions.TeamStats_CurrentEvent> Update_TeamStats_CurrentEvent { get; set; }
		internal bool UserRequestedEvent { get; set; }
	}
}
