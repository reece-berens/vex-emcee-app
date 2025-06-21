using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.Logic.InternalLogic
{
	internal class Program
	{
		/// <summary>
		/// Retrieves a list of selectable programs based on the provided request.
		/// </summary>
		/// <remarks>This method asynchronously fetches program data from the database and maps it to a response
		/// format suitable for API consumption. The response includes program details such as ID and name.</remarks>
		/// <param name="request">The request object containing parameters for retrieving selectable programs.</param>
		/// <returns>A <see cref="GetSelectableProgramsResponse"/> object containing the list of selectable programs, along with the
		/// status code and success indicator.</returns>
		internal static async Task<GetSelectableProgramsResponse> GetSelectablePrograms(GetSelectableProgramsRequest request)
		{
			//Although the request is not currently used, it may be needed in the future, so add it here just in case
			List<DB.Dynamo.Definitions.Program> programList = await DB.Dynamo.Accessors.Program.GetSelectableProgramList();
			GetSelectableProgramsResponse response = new()
			{
				Programs = [],
				StatusCode = System.Net.HttpStatusCode.OK,
				Success = true,
			};
			foreach (DB.Dynamo.Definitions.Program program in programList)
			{
				Objects.API.Helpers.Program programResponse = new()
				{
					ID = program.ID,
					Name = $"{program.Abbreviation} - {program.Name}",
				};
				response.Programs.Add(programResponse);
			}
			return response;
		}
	}
}
