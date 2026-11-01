/**
 * Parsers for the stat text the API sends in SectionData.
 *
 * The backend formats every stat as a sentence (for example "Average per match: 72.7 points").
 * The match and team pages pull the numbers back out with these, so both will read the text the same way.
 * Each parser takes a possibly missing string and returns the number as text, or null when it isn't there.
 */

type StatText = string | null | undefined;

/**
 * The first win-loss-tie record in the text.
 * "2-0-1" -> "2-0-1", "3-2-0 - 5 Total" -> "3-2-0", "All Matches: 25-12-0 - 67.6% Win Pct." -> "25-12-0"
 */
export function parseRecord(text: StatText): string | null {
	const match = text?.match(/(\d+)-(\d+)-(\d+)/);
	return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

/**
 * The first percentage in the text, without the % sign.
 * "83.3% Win Pct." -> "83.3", "100.0% Win Rate" -> "100.0"
 */
export function parsePercent(text: StatText): string | null {
	return text?.match(/([\d.]+)%/)?.[1] ?? null;
}

/**
 * The number before "point" or "points".
 * "Total: 218 points" -> "218", "Average per match: 72.7 points" -> "72.7"
 */
export function parsePoints(text: StatText): string | null {
	return text?.match(/([\d.]+)\s*points?/i)?.[1] ?? null;
}
