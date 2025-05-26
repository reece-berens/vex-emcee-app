namespace RE.Objects
{
	public class PaginatedMatch : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<MatchObj> Data { get; set; }
	}
}
