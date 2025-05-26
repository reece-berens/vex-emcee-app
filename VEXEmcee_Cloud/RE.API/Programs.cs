using RE.Objects;
using System.Text;
using System.Text.Json;

namespace RE.API
{
	public class Programs
	{
		public async static Task<PaginatedProgram> List(Requests.BaseRequest request)
		{
			StringBuilder queryString = request.InitializeQueryString();
			queryString.Length--; // Remove the last '&' character (or '?' if there is no query string)

			BaseDataResponse response = await Accessor.BaseRequestData($"programs");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<PaginatedProgram>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Programs.List: ERROR retrieving data - {response.Error}");
				return null;
			}
		}

		public async static Task<RE.Objects.Program> Single(Requests.IDBase request)
		{
			BaseDataResponse response = await Accessor.BaseRequestData($"programs/{request.ID}");
			if (response.WasSuccessful)
			{
				//correct type returned
				return JsonSerializer.Deserialize<RE.Objects.Program>(response.Response, Accessor.SerializerReadOptions);
			}
			else
			{
				Console.WriteLine($"RE.API.Programs.Single: ERROR retrieving data - {response.Error}");
				return null;
			}
		}
	}
}
