using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;
using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;

namespace VEXEmcee.Logic.InternalLogic
{
	internal static class REEvent
	{
		/// <summary>
		/// Retrieves a paginated list of events from the RE API based on the specified request parameters.
		/// </summary>
		/// <remarks>This method queries the RE API to fetch event data, including metadata such as total count, page
		/// size, and next page information. It also applies constraints such as a maximum page size of 50 and retrieves the
		/// active season for the specified program, if applicable. If the RE API fails to return a response, the method
		/// provides an error message and default values in the response object.</remarks>
		/// <param name="request">The request object containing parameters for filtering and pagination, such as region, page number, page size,
		/// SKU, and program ID.</param>
		/// <returns>A <see cref="GetREEventListResponse"/> object containing the list of events, pagination metadata, and status
		/// information. If the RE API fails, the response includes an error message and indicates failure.</returns>
		internal static async Task<GetREEventListResponse> GetREEventList(GetREEventListRequest request)
		{
			//TODO LATER - add in an event name parameter, not currently supported by RE API so I'll have to add in some custom logic to handle it
			RE.API.Requests.Events.List reAPIRequest = new()
			{
				Region = request.Region,
				Page = request.Page ?? 1, //RE API starts page index at 1
				PageSize = request.PageSize ?? 25,
				//StartDate = DateTime.UtcNow.AddDays(-1) //may want to add this later, but leave commented out for now
			};
			if (reAPIRequest.PageSize > 50)
			{
				reAPIRequest.PageSize = 50; //force a max page size of 50
			}
			//query the Season table to find the currently active season for the specified program
			if (!string.IsNullOrWhiteSpace(request.SKU))
			{
				reAPIRequest.SKU = [request.SKU];
			}
			if (request.ProgramID == 0)
			{
				return new()
				{
					ErrorMessage = "A Program must be selected to retrieve events.",
					Events = [],
					NextPage = 1,
					PageSize = request.PageSize ?? 25,
					StatusCode = System.Net.HttpStatusCode.BadRequest,
					Success = false,
					TotalCount = 0,
				};
			}
			Definitions.Season activeSeason = await Accessors.Season.GetActiveSeasonByProgramID(request.ProgramID);
			if (activeSeason != null)
			{
				reAPIRequest.Season = [activeSeason.ID];
			}

			RE.Objects.PaginatedEvent reAPIResponse = await RE.API.Events.List(reAPIRequest);
			if (reAPIResponse == null)
			{
				//some error occurred reading the data, return no events and an error message
				return new()
				{
					ErrorMessage = "Unable to retrieve events from RE API. Please try again later.",
					Events = [],
					NextPage = 1,
					PageSize = request.PageSize ?? 25,
					StatusCode = System.Net.HttpStatusCode.InternalServerError,
					Success = false,
					TotalCount = 0
				};
			}
			else
			{
				GetREEventListResponse response = new()
				{
					Events = [],
					PageSize = reAPIResponse.Meta.Per_Page,
					StatusCode = System.Net.HttpStatusCode.OK,
					Success = true,
					TotalCount = reAPIResponse.Meta.Total,
				};
				//find next page
				if (reAPIResponse.Meta.Current_Page < reAPIResponse.Meta.Last_Page)
				{
					response.NextPage = reAPIResponse.Meta.Current_Page + 1;
				}
				else
				{
					response.NextPage = reAPIResponse.Meta.Current_Page; //no next page, set to current page
				}

				//build event information to return
				foreach (RE.Objects.Event reEvent in reAPIResponse.Data)
				{
					Objects.API.Helpers.REEvent responseEvent = new()
					{
						Divisions = [],
						ID = reEvent.Id,
						Name = reEvent.Name,
						SKU = reEvent.Sku,
						StartDate = reEvent.Start.ToString("MM-dd-yyyy")
					};
					if (reEvent.Divisions != null)
					{
						foreach (RE.Objects.Division division in reEvent.Divisions)
						{
							Objects.API.Helpers.REEventDivision responseDivision = new()
							{
								ID = division.Id,
								Name = division.Name
							};
							responseEvent.Divisions.Add(responseDivision);
						}
					}
					response.Events.Add(responseEvent);
				}
				return response;
			}
		}
	}
}
