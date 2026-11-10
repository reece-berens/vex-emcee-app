/**
 * Match list groups: the headings on the matches page.
 *
 * The server (MatchList/V5RC.cs) leaves out practice matches, sorts the rest by round, number
 * and instance, finds the last scored match, and sends the 3 matches ending there, then
 * everything after, then everything before. This rebuilds those same slices, so each group
 * starts exactly where the server's does, even when a match was skipped or scored late.
 */

import { parseMatchKey } from "./matchLabel";
import type { MatchKeyParts } from "./matchLabel";

export type GroupId = "latest" | "upNext" | "earlier" | "results" | "schedule";

export type MatchGroup<T> = { id: GroupId; title: string; matches: T[] };

type ListMatch = { Key: string; Scored: boolean };

// Round order in the list (the server's expectedSortOrder), by MatchRoundType number
const ROUND_ORDER = [2, 9, 8, 7, 6, 3, 4, 5];

const TITLES: Record<GroupId, string> = {
	latest: "Latest results",
	upNext: "Up next",
	earlier: "Earlier results",
	results: "Results",
	schedule: "Schedule",
};

const group = <T>(id: GroupId, matches: T[]): MatchGroup<T> => ({ id, title: TITLES[id], matches });

const byRoundThenNumber = (a: MatchKeyParts, b: MatchKeyParts) =>
	ROUND_ORDER.indexOf(a.round) - ROUND_ORDER.indexOf(b.round) || a.number - b.number || a.instance - b.instance;

/**
 * The list split into its headed groups, in the server's order.
 * Returns null when a key doesn't parse or a match is in a round the list doesn't show,
 * so the page can show the list as it came.
 */
export function groupMatches<T extends ListMatch>(matches: T[]): MatchGroup<T>[] | null {
	if (matches.length === 0) return [];

	const parsed: { match: T; parts: MatchKeyParts }[] = [];
	for (const match of matches) {
		const parts = parseMatchKey(match.Key);
		if (!parts || !ROUND_ORDER.includes(parts.round)) return null;
		parsed.push({ match, parts });
	}

	const sorted = parsed.sort((a, b) => byRoundThenNumber(a.parts, b.parts)).map(({ match }) => match);
	const lastScored = sorted.findLastIndex((match) => match.Scored);

	if (lastScored === -1) return [group("schedule", sorted)];
	if (lastScored === sorted.length - 1) return [group("results", sorted)];
	if (lastScored < 3) {
		return [group("latest", sorted.slice(0, lastScored + 1)), group("upNext", sorted.slice(lastScored + 1))];
	}
	return [
		group("latest", sorted.slice(lastScored - 2, lastScored + 1)),
		group("upNext", sorted.slice(lastScored + 1)),
		group("earlier", sorted.slice(0, lastScored - 2)),
	];
}
