using RE.Objects;
using System.Net;
using System.Text;
using System.Text.Json;

namespace RE.API
{
	public class Teams
	{
		public async static Task<PaginatedEvent> EventsAttended(Requests.Teams.EventsAttended request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			if (request.SKU != null)
			{
				foreach (string sku in request.SKU)
				{
					queryString.Append($"sku={WebUtility.UrlEncode(sku)}&");
				}
			}
			if (request.Season != null)
			{
				foreach (int season in request.Season)
				{
					queryString.Append($"season={season}&");
				}
			}
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"teams/{request.ID}/events{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedEvent>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Teams.EventsAttended: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<RE.Objects.Team> Single(Requests.IDBase request)
		{
			BaseDataResponse response = await Accessor.BaseRequestData($"teams/{request.ID}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<RE.Objects.Team>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Teams.Single: ERROR retrieving data - {response.Error}");
				return null;
			}
		}
	}
}
