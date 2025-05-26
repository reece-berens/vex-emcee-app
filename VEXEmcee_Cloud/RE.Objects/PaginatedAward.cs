namespace RE.Objects
{
	public class PaginatedAward : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<Award> Data { get; set; }
	}
}
