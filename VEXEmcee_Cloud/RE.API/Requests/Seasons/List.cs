namespace RE.API.Requests.Seasons
{
	public class List : BaseRequest
	{
		public bool? IsActive { get; set; }
		public List<int> Program { get; set; }
	}
}
