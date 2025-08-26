using System.Reflection;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	public class Team
	{
		public static async Task<Definitions.Team> GetTeamByID(int teamID)
		{
			try
			{
				await Common.ValidateTable<Definitions.Team>();
				Definitions.Team ev = await Dynamo.Context.LoadAsync<Definitions.Team>(teamID);
				if (ev != null)
				{
					//manually populate the Grade
					ev.Grade = (ev?.GradeString) switch
					{
						"College" => RE.Objects.Grade.College,
						"High School" => RE.Objects.Grade.High_School,
						"Middle School" => RE.Objects.Grade.Middle_School,
						"Elementary School" => RE.Objects.Grade.Elementary_School,
						_ => RE.Objects.Grade.Unknown,
					};
				}
				return ev;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(17, $"Generic exception received: {ex.Message}");
			}
		}

		public static async Task<List<Definitions.Team>> GetByTeamIDList(List<int> keys)
		{
			try
			{
				List<Definitions.Team> returnValue = [];
				await Common.ValidateTable<Definitions.Team>();

				var batchGetOperation = Dynamo.Context.CreateBatchGet<Definitions.Team>();
				foreach (int key in keys)
				{
					batchGetOperation.AddKey(key, null);
				}

				await batchGetOperation.ExecuteAsync();

				return batchGetOperation.Results;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(18, $"Generic exception received: {ex.Message}");
			}
		}

		public static async Task SaveTeam(Definitions.Team team)
		{
			try
			{
				await Common.ValidateTable<Definitions.Team>();
				//ensure the GradeString property is set correctly
				team.GradeString = team.Grade.ToString();
				await Dynamo.Context.SaveAsync(team);
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(19, $"Generic exception received: {ex.Message}");
			}
		}
	}
}
