using Accessors = VEXEmcee.DB.Dynamo.Accessors;
using Definitions = VEXEmcee.DB.Dynamo.Definitions;
using VEXEmcee.Objects.API.Request;
using VEXEmcee.Objects.API.Response;

namespace VEXEmcee.Logic.InternalLogic.MatchList
{
	internal static class V5RC
	{
		/// <summary>
		/// Retrieves a list of matches for the specified event and populates the response object in the V5RC format.
		/// </summary>
		/// <remarks>This method fetches match data associated with the specified event and updates the response
		/// object. The match data may be cached or retrieved from an external API, depending on the timing of the last
		/// request. Ensure that the <paramref name="request"/> and <paramref name="response"/> objects are properly
		/// initialized before calling this method.</remarks>
		/// <param name="request">The request object containing parameters for retrieving match data.</param>
		/// <param name="response">The response object to be populated with the list of matches.</param>
		/// <param name="thisEvent">The event for which match data is being retrieved.</param>
		internal static async Task GetMatchList(GetMatchListRequest request, GetMatchListResponse response, Definitions.Event thisEvent)
		{
			response.Matches = [];

			List<Definitions.LiveMatch> liveMatches = await Accessors.LiveMatch.GetByEventID(thisEvent.ID);
			//we have all of the matches for the event, now sort them in the appropriate order
			SortMatches(liveMatches);

			//once sorted, convert to V5RC response type
			for(int i = 0; i < liveMatches.Count; i++)
			{
				Objects.Data.ClientApp.MatchList.V5RC convertedMatch = ConvertToOutput(liveMatches[i]);
				convertedMatch.SortOrder = i;
				response.Matches.Add(convertedMatch);
			}
		}

		internal static bool IsScored(Definitions.LiveMatch match)
		{
			return match.BlueScore != 0 || match.RedScore != 0 || match.ScoreFinalized;
		}

		internal static void SortMatches(List<Definitions.LiveMatch> matches)
		{
			if (matches == null || matches.Count == 0)
				return;
			// Ignore practice matches
			var nonPracticeMatches = matches
				.Where(m => m.Round != RE.Objects.MatchRoundType.Practice)
				.ToList();
			//this order is how they should show up in the list for normal unscored or scored matches
			List<RE.Objects.MatchRoundType> expectedSortOrder = [
				RE.Objects.MatchRoundType.Qualification,
				RE.Objects.MatchRoundType.Round128,
				RE.Objects.MatchRoundType.Round64,
				RE.Objects.MatchRoundType.Round32,
				RE.Objects.MatchRoundType.Round16,
				RE.Objects.MatchRoundType.QuarterFinal,
				RE.Objects.MatchRoundType.SemiFinal,
				RE.Objects.MatchRoundType.Final
			];

			Dictionary<RE.Objects.MatchRoundType, List<Definitions.LiveMatch>> groupedMatches = [];
			foreach (Definitions.LiveMatch match in nonPracticeMatches)
			{
				if (!groupedMatches.TryGetValue(match.Round, out List<Definitions.LiveMatch> groupedMatchList))
				{
					groupedMatches[match.Round] = groupedMatchList = [];
				}
				groupedMatchList.Add(match);
			}

			//now that they're grouped by round, sort each group by match number and instance and add to a big array
			List<Definitions.LiveMatch> sortedMatchesByRound = [];
			foreach (RE.Objects.MatchRoundType round in expectedSortOrder)
			{
				if (groupedMatches.TryGetValue(round, out List<Definitions.LiveMatch> groupedMatchList))
				{
					List<Definitions.LiveMatch> sortedGroup = [.. groupedMatchList
						.OrderBy(m => m.MatchNumber)
						.ThenBy(m => m.Instance)];
					sortedMatchesByRound.AddRange(sortedGroup);
				}
			}

			//find the most recently scored match
			int mostRecentlyScoredMatch = sortedMatchesByRound.FindLastIndex(IsScored);
			if (mostRecentlyScoredMatch == -1 || mostRecentlyScoredMatch < 3 || mostRecentlyScoredMatch == sortedMatchesByRound.Count - 1)
			{
				//no scored matches, or it's one of the 3 earliest matches, or all matches are scored, so just use the sorted list
				matches.Clear();
				matches.AddRange(sortedMatchesByRound);
			}
			else
			{
				matches.Clear();
				matches.AddRange(sortedMatchesByRound.Take(new Range(mostRecentlyScoredMatch - 2, mostRecentlyScoredMatch + 1))); //take most recent match plus 2 before it
				matches.AddRange(sortedMatchesByRound.Skip(mostRecentlyScoredMatch + 1)); //take the rest of the matches in sorted list
				matches.AddRange(sortedMatchesByRound.Take(new Range(0, mostRecentlyScoredMatch - 2))); //take any matches before the most recently scored 3
			}
		}

		internal static Objects.Data.ClientApp.MatchList.V5RC ConvertToOutput(Definitions.LiveMatch match)
		{
			Objects.Data.ClientApp.MatchList.V5RC returnValue = new()
			{
				ID = match.ID,
				MatchName = match.Name,
				Scored = IsScored(match),
				Blue = new()
				{
					Score = match.BlueScore,
					TeamNumbers = match.Alliances.FirstOrDefault(a => a.Color.Equals("Blue", StringComparison.OrdinalIgnoreCase))?.Teams
						.Select(t => t.Number).ToList() ?? [],
				},
				Red = new()
				{
					Score = match.RedScore,
					TeamNumbers = match.Alliances.FirstOrDefault(a => a.Color.Equals("Red", StringComparison.OrdinalIgnoreCase))?.Teams
						.Select(t => t.Number).ToList() ?? [],
				},
				BlueWin = match.MatchWinner.Equals("Blue", StringComparison.OrdinalIgnoreCase),
				RedWin = match.MatchWinner.Equals("Red", StringComparison.OrdinalIgnoreCase),
				Tie = match.MatchWinner.Equals("Tie", StringComparison.OrdinalIgnoreCase),
			};

			return returnValue;
		}
	}
}
