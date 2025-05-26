namespace RE.API.Requests.Events
{
	public class DivisionIDBase : IDBase
	{
		public int DivisionID { get; set; }
		public List<int> TeamIDs { get; set; }
	}
}
