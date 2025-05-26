using System.Text;

namespace RE.API.Requests
{
	public class BaseRequest
	{
		public int? Page { get; set; }
		public int? PageSize { get; set; }
		
		internal StringBuilder InitializeQueryString()
		{
			StringBuilder queryString = new StringBuilder("?");
			if (Page.HasValue)
			{
				queryString.Append($"page={Page.Value}&");
			}
			if (PageSize.HasValue)
			{
				queryString.Append($"per_page={PageSize.Value}&");
			}
			return queryString;
		}
	}
}
