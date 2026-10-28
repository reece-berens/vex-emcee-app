using System.Text.Json;
using VEXEmcee.Objects.Exceptions;

namespace RE.API
{
	public static class Accessor
	{
		private static string _accessToken = string.Empty;
		private static readonly Uri _baseUri = new("https://www.robotevents.com/api/v2/");
		private static readonly HttpClient _httpClient = new();

		internal static JsonSerializerOptions SerializerReadOptions { get; } = new()
		{
			PropertyNameCaseInsensitive = true
		};

		public static void SetAccessToken(string accessToken)
		{
			_accessToken = accessToken;
		}

		internal async static Task<BaseDataResponse> BaseRequestData(string relativePath)
		{
			if (_accessToken == string.Empty)
			{
				throw new REAPIException(1, "Access token is not set.");
			}

			try
			{
				await Task.Delay(Random.Shared.Next(1250, 3000)); //being a good steward of the API and not hitting it too fast
				HttpRequestMessage request = new()
				{
					Method = HttpMethod.Get,
					RequestUri = new(_baseUri, relativePath),
				};
				Console.WriteLine(relativePath);
				request.Headers.Authorization = new("Bearer", _accessToken);
				request.Headers.Accept.Add(new("application/json"));

				HttpResponseMessage response = await _httpClient.SendAsync(request);
				if (response.IsSuccessStatusCode)
				{
					string jsonResponse = await response.Content.ReadAsStringAsync();
					BaseDataResponse dataResponse = new()
					{
						WasSuccessful = true,
						Response = jsonResponse,
					};
					return dataResponse;
				}
				else
				{
					string errorResponse = await response.Content.ReadAsStringAsync();
					Console.WriteLine(response.StatusCode);
					Console.WriteLine(errorResponse);
                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        Console.WriteLine("RE.API.Accessor.BaseRequestData: Hit rate limit on RE API, immediately exiting and can continue later.");
						Environment.Exit(1);
                    }
                    BaseDataResponse dataResponse = new()
					{
						WasSuccessful = false,
						Error = JsonSerializer.Deserialize<RE.Objects.Error>(errorResponse),
					};
					return dataResponse;
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"RE.API.Accessor.BaseRequestData: ERROR during request - {ex.Message}");
				Console.WriteLine(ex.StackTrace);
				return new()
				{
					WasSuccessful = false,
					Error = new()
					{
						Message = "An error occurred while processing the request."
					}
				};
			}
		}
	}
}
