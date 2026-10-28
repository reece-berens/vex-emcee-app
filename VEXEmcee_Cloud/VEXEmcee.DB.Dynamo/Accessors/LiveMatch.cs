using Amazon.DynamoDBv2.DataModel;
using RE.Objects;
using System.Reflection;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	public static class LiveMatch
	{
		public static async Task<List<Definitions.LiveMatch>> GetByEventID(int eventID)
		{
			try
			{
				List<Definitions.LiveMatch> returnValue = [];
				await Common.ValidateTable<Definitions.LiveMatch>();

				IAsyncSearch<Definitions.LiveMatch> scanResult = Dynamo.Context.FromScanAsync<Definitions.LiveMatch>(new Amazon.DynamoDBv2.DocumentModel.ScanOperationConfig()
				{
					FilterExpression = new Amazon.DynamoDBv2.DocumentModel.Expression
					{
						ExpressionStatement = "EventID = :eventID",
						ExpressionAttributeValues = new Dictionary<string, Amazon.DynamoDBv2.DocumentModel.DynamoDBEntry>()
						{
							{":eventID", new Amazon.DynamoDBv2.DocumentModel.Primitive(eventID.ToString(), true) }
						}
					}
				});

				do
				{
					List<Definitions.LiveMatch> tempItems = await scanResult.GetNextSetAsync();
					returnValue.AddRange(tempItems);
				} while (!scanResult.IsDone);

				foreach (Definitions.LiveMatch match in returnValue)
				{
					match.Round = (match?.RoundString) switch
					{
						"Practice" => RE.Objects.MatchRoundType.Practice,
						"Qualification" => RE.Objects.MatchRoundType.Qualification,
						"QuarterFinal" => RE.Objects.MatchRoundType.QuarterFinal,
						"SemiFinal" => RE.Objects.MatchRoundType.SemiFinal,
						"Final" => RE.Objects.MatchRoundType.Final,
						"Round16" => RE.Objects.MatchRoundType.Round16,
						"Round32" => RE.Objects.MatchRoundType.Round32,
						"Round64" => RE.Objects.MatchRoundType.Round64,
						"Round128" => RE.Objects.MatchRoundType.Round128,
						_ => RE.Objects.MatchRoundType.Unknown,
					};
				}

				return returnValue;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(22, $"Generic exception received: {ex.Message}");
			}
		}

		public static async Task<Definitions.LiveMatch> GetByMatchID(string matchKey, int eventID)
		{
			try
			{
				await Common.ValidateTable<Definitions.Team>();
				Definitions.LiveMatch match = await Dynamo.Context.LoadAsync<Definitions.LiveMatch>(matchKey, eventID);
				if (match != null)
				{
					//manually populate the Round
					match.Round = (match?.RoundString) switch
					{
						"Practice" => RE.Objects.MatchRoundType.Practice,
						"Qualification" => RE.Objects.MatchRoundType.Qualification,
						"QuarterFinal" => RE.Objects.MatchRoundType.QuarterFinal,
						"SemiFinal" => RE.Objects.MatchRoundType.SemiFinal,
						"Final" => RE.Objects.MatchRoundType.Final,
						"Round16" => RE.Objects.MatchRoundType.Round16,
						"Round32" => RE.Objects.MatchRoundType.Round32,
						"Round64" => RE.Objects.MatchRoundType.Round64,
						"Round128" => RE.Objects.MatchRoundType.Round128,
						_ => RE.Objects.MatchRoundType.Unknown,
					};
				}
				return match;
			}
			catch (DynamoDBException ex)
			{
				ex.LogException();
				throw;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception - {MethodBase.GetCurrentMethod()?.Name} - {ex.Message}");
				throw new DynamoDBException(20, $"Generic exception received: {ex.Message}");
			}
		}

		public static async Task SaveMatch(Definitions.LiveMatch team)
		{
			try
			{
				await Common.ValidateTable<Definitions.LiveMatch>();
				//ensure the RoundString property is set correctly
				team.RoundString = team.Round.ToString();
				team.CompositeKey = $"{team.EventID}~{team.DivisionID}~{team.RoundString}~{team.Instance}~{team.MatchNumber}";
				//update the LastUpdated property
				team.LastUpdated = DateTime.UtcNow;
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
				throw new DynamoDBException(21, $"Generic exception received: {ex.Message}");
			}
		}
	}
}
