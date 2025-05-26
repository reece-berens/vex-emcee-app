namespace RE.Objects
{
	public class PaginatedEvent : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<Event> Data { get; set; }
	}
}
