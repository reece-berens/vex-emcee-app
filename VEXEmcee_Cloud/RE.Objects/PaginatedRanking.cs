namespace RE.Objects
{
	public class PaginatedRanking : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<Ranking> Data { get; set; }
	}
}
