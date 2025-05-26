namespace RE.Objects
{
	public class PaginatedTeam : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<Team> Data { get; set; }
	}
}
