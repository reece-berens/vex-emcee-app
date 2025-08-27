namespace VEXEmcee.Logic.InternalLogic.Helpers
{
	internal static class Team
	{
		/// <summary>
		/// Sorts teams by their Number property, which consists of a numeric portion (2-5 digits) followed by a single uppercase letter.
		/// Teams are sorted first by the numeric portion (ascending), then by the letter (alphabetically).
		/// Returns a dictionary mapping team ID to its sort order (0-based index in sorted list).
		/// </summary>
		internal static Dictionary<int, int> SortTeamsByNumber(List<DB.Dynamo.Definitions.Team> teams)
		{
			ArgumentNullException.ThrowIfNull(teams);

			// Helper to extract numeric and letter portions
			(int num, char letter) ParseNumber(string number)
			{
				if (string.IsNullOrEmpty(number) || number.Length < 3)
					return (int.MaxValue, '\0');

				// Find where the digits end
				int i = 0;
				while (i < number.Length - 1 && char.IsDigit(number[i]))
					i++;

				// Numeric portion: from start to i (exclusive)
				string numPart = number[..i];
				char letterPart = number[i];

				int numValue = int.TryParse(numPart, out int n) ? n : int.MaxValue;
				return (numValue, letterPart);
			}

			var sorted = teams
				.Select(t => new
				{
					Team = t,
					Parsed = ParseNumber(t.Number)
				})
				.OrderBy(x => x.Parsed.num)
				.ThenBy(x => x.Parsed.letter)
				.Select((x, idx) => new { x.Team.ID, SortOrder = idx })
				.ToDictionary(x => x.ID, x => x.SortOrder);

			return sorted;
		}
	}
}
