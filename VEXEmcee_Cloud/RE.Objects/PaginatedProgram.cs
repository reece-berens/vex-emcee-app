namespace RE.Objects
{
	public class PaginatedProgram : BaseAPIResponse
	{
		public PageMeta Meta { get; set; }
		public List<Program> Data { get; set; }
	}
}
