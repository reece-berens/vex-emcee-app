namespace RE.API.Requests.Teams
{
	public class EventsAttended : IDBase
	{
		public List<string> SKU { get; set; }
		public List<int> Season { get; set; }
	}
}
