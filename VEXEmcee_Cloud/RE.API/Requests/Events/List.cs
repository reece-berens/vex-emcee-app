namespace RE.API.Requests.Events
{
	public class List : BaseRequest
	{
		public List<string> SKU { get; set; }
		public List<int> Team { get; set; }
		public List<int> Season { get; set; }
		public DateTime? StartDate { get; set; }
		public DateTime? EndDate { get; set; }
		public string Region { get; set; }
		public List<RE.Objects.EventLevel> EventLevel { get; set; }
		public List<RE.Objects.EventType> EventType { get; set; }
	}
}
