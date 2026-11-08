/**
 * Match labels for the match screen header.
 *
 * Built from the round, series and game numbers the match info endpoint sends.
 * Round numbers are RobotEvents' MatchRoundType (RE.Objects/MatchRoundType.cs).
 * The game number only shows from game 2, since most series are a single game.
 */

const ROUND_OF: Record<number, number> = { 6: 16, 7: 32, 8: 64, 9: 128 };

export function matchLabel(round: number, instance: number, number: number): string {
	const game = number >= 2 ? `, Game ${number}` : "";

	switch (round) {
		case 1:
			return `Practice Match ${number}`;
		case 2:
			return `Qualification Match ${number}`;
		case 3:
			return `Quarterfinal ${instance}${game}`;
		case 4:
			return `Semifinal ${instance}${game}`;
		case 5:
			return `Final${game}`;
	}

	if (ROUND_OF[round]) {
		return `Round of ${ROUND_OF[round]}, Match ${instance}${game}`;
	}

	return `Match ${number}`;
}

/** Round names as they appear in match keys (the MatchRoundType names) */
const ROUND_NUMBERS: Record<string, number> = {
	Practice: 1,
	Qualification: 2,
	QuarterFinal: 3,
	SemiFinal: 4,
	Final: 5,
	Round16: 6,
	Round32: 7,
	Round64: 8,
	Round128: 9,
	Unknown: 99,
};

/**
 * The same label, read from a match key: "{EventID}~{DivisionID}~{Round}~{Instance}~{MatchNumber}".
 * "99001~1~Qualification~1~3" -> "Qualification Match 3"
 * Returns null when the key isn't in that shape, so the caller can show something else.
 */
export function matchLabelFromKey(key: string): string | null {
	const parts = key.split("~");
	if (parts.length !== 5) return null;

	const [, , roundName, instance, number] = parts;
	const round = ROUND_NUMBERS[roundName];
	if (round === undefined || !/^\d+$/.test(instance) || !/^\d+$/.test(number)) return null;

	return matchLabel(round, Number(instance), Number(number));
}
