using RE.Objects;
using System.Net;
using System.Text;
using System.Text.Json;

namespace RE.API
{
	public static class Events
	{
		public async static Task<PaginatedAward> Awards(Requests.Events.Awards request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"events/{request.ID}/awards{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedAward>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.Awards: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<PaginatedRanking> DivisionFinalistRankings(Requests.Events.DivisionRanking request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			if (request.Rank != null)
			{
				foreach (int rank in request.Rank)
				{
					queryString.Append($"rank={rank}&");
				}
			}
			if (request.TeamIDs != null)
			{
				foreach (int teamID in request.TeamIDs)
				{
					queryString.Append($"team={teamID}&");
				}
			}
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"events/{request.ID}/divisions/{request.DivisionID}/finalistRankings{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedRanking>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.DivisionFinalistRankings: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<PaginatedMatch> DivisionMatches(Requests.Events.DivisionMatches request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			if (request.Instance != null)
			{
				foreach (int instance in request.Instance)
				{
					queryString.Append($"instance={instance}&");
				}
			}
			if (request.MatchNumber != null)
			{
				foreach (int matchNumber in request.MatchNumber)
				{
					queryString.Append($"matchnum={matchNumber}&");
				}
			}
			if (request.Round != null)
			{
				foreach (MatchRoundType round in request.Round)
				{
					queryString.Append($"round={round}&");
				}
			}
			if (request.TeamIDs != null)
			{
				foreach (int teamID in request.TeamIDs)
				{
					queryString.Append($"team={teamID}&");
				}
			}
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"events/{request.ID}/divisions/{request.DivisionID}/matches{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedMatch>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.DivisionMatches: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<PaginatedRanking> DivisionRankings(Requests.Events.DivisionRanking request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			if (request.Rank != null)
			{
				foreach (int rank in request.Rank)
				{
					queryString.Append($"rank={rank}&");
				}
			}
			if (request.TeamIDs != null)
			{
				foreach (int teamID in request.TeamIDs)
				{
					queryString.Append($"team={teamID}&");
				}
			}
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"events/{request.ID}/divisions/{request.DivisionID}/rankings{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedRanking>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.DivisionRankings: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<PaginatedEvent> List(Requests.Events.List request)
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
			if (!string.IsNullOrWhiteSpace(request.Region))
			{
				queryString.Append($"region={WebUtility.UrlEncode(request.Region)}&");
			}
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"events{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedEvent>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.List: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<RE.Objects.Event> Single(Requests.IDBase request)
		{
			BaseDataResponse response = await Accessor.BaseRequestData($"events/{request.ID}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<RE.Objects.Event>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.Single: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<PaginatedSkill> Skills(Requests.Events.Skills request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"events/{request.ID}/skills{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedSkill>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.Skills: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<PaginatedTeam> TeamsPresent(Requests.Events.TeamsPresent request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"events/{request.ID}/teams{queryString}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedTeam>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Events.TeamsPresent: ERROR retrieving data - {response.Error}");
				return null;
			}
		}
	}
}
