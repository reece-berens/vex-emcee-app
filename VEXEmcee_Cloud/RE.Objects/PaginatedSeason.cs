namespace RE.Objects
{
	public class PaginatedSeason : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<Season> Data { get; set; }
	}
}
