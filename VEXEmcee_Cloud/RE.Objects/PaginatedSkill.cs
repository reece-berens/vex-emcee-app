namespace RE.Objects
{
	public class PaginatedSkill : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<Skill> Data { get; set; }
	}
}
