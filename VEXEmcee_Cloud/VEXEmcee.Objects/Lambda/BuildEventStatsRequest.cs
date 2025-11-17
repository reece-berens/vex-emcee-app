namespace VEXEmcee.Objects.Lambda
{
	public class BuildEventStatsRequest
	{
		public int EventID { get; set; }
		/// <summary>
		/// Did a user request this event?
		/// If true, recursively get all events for each team at this tournament and load those
		/// If false, just build stats for this event
		/// </summary>
		public bool UserRequestedEvent { get; set; }
	}
}
