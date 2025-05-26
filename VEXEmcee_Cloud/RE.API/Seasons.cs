using RE.Objects;
using System.Text;
using System.Text.Json;

namespace RE.API
{
	public class Seasons
	{
		public async static Task<PaginatedSeason> List(Requests.Seasons.List request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			if (request.Program != null)
			{
				foreach (int program in request.Program)
				{
					queryString.Append($"program={program}&");
				}
			}
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"seasons");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedSeason>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Seasons.List: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<RE.Objects.Season> Single(Requests.IDBase request)
		{
			BaseDataResponse response = await Accessor.BaseRequestData($"seasons/{request.ID}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<RE.Objects.Season>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Seasons.Single: ERROR retrieving data - {response.Error}");
				return null;
			}
		}
	}
}
