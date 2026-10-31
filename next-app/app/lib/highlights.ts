/**
 * Highlights: short stats an emcee can read out for a team on the match screen.
 *
 * Each extractor reads one stat from a team's match info sections and returns
 * { label, value }, or null when the stat is missing or zero (nothing worth saying).
 * The picker shuffles what's available and takes the first few.
 *
 * The random function is an argument so a test can pass a fixed one and get
 * the same order every run. The page uses the default, Math.random.
 */

type Team = VEXEmcee.API.Objects.MatchInfo.V5RCTeam;
type Section = VEXEmcee.API.Objects.Display.SectionHeader;
type SectionDisplay = VEXEmcee.API.Objects.Display.SectionDisplay;

export type Highlight = { label: string; value: string };
export type Extractor = (team: Team) => Highlight | null;
/** Returns a number from 0 (inclusive) to 1 (exclusive), like Math.random */
export type RandomFn = () => number;

// Section names from master's MatchInfo/V5RC.cs
const THIS_EVENT = "This Event";
const SEASON = "Season Stats Entering This Tournament";

/** Shown when a team has no stats to pick from */
const NO_STATS: Highlight[] = [
	{ label: "Record", value: "—" },
	{ label: "Avg Pts", value: "—" },
];
/** Fills the last slot when a team has fewer highlights than requested */
const EMPTY_SLOT: Highlight = { label: "—", value: "—" };

const findSection = (team: Team, name: string): Section | undefined => team.Stats?.find((section) => section.Name === name);

const findDisplay = (section: Section | undefined, isMatch: (label: string) => boolean): SectionDisplay | undefined =>
	section?.Display?.find((display) => isMatch(display.SectionLabel));

/** Runs a regex on one line of a display and returns the first captured group */
const capture = (display: SectionDisplay | undefined, line: number, pattern: RegExp): string | undefined =>
	display?.SectionData?.[line]?.match(pattern)?.[1];

/** Treats a missing or zero number as nothing to say */
const nonZero = (value: string | undefined): value is string => value !== undefined && parseFloat(value) !== 0;

const winRate: Extractor = (team) => {
	const wlt = findDisplay(findSection(team, THIS_EVENT), (label) => label.includes("Overall WLT"));
	const percent = capture(wlt, 1, /([\d.]+)%/);
	return nonZero(percent) ? { label: "Win Rate", value: `${percent}%` } : null;
};

const averagePoints: Extractor = (team) => {
	const points = findDisplay(findSection(team, THIS_EVENT), (label) => label === "Points Scored");
	const average = capture(points, 1, /([\d.]+)\s*points/i);
	return nonZero(average) ? { label: "Avg Points", value: average } : null;
};

const totalPoints: Extractor = (team) => {
	const points = findDisplay(findSection(team, THIS_EVENT), (label) => label === "Points Scored");
	const total = capture(points, 0, /([\d.]+)\s*points/i);
	return nonZero(total) ? { label: "Total Points", value: total } : null;
};

const seasonWinRate: Extractor = (team) => {
	const wlt = findDisplay(findSection(team, SEASON), (label) => label === "WLT");
	const percent = capture(wlt, 0, /All Matches:.*?([\d.]+)%/);
	return nonZero(percent) ? { label: "Season Win%", value: `${percent}%` } : null;
};

const seasonAwards: Extractor = (team) => {
	const awards = findDisplay(findSection(team, SEASON), (label) => label === "Awards");
	const count = capture(awards, 0, /(\d+)\s*Total/i);
	return nonZero(count) ? { label: "Awards", value: count } : null;
};

const eliminationRecord: Extractor = (team) => {
	const wlt = findDisplay(findSection(team, SEASON), (label) => label === "WLT");
	const record = capture(wlt, 2, /Elimination.*?(\d+-\d+-\d+)/);
	if (!record) return null;
	const wins = Number(record.split("-")[0]);
	return wins === 0 ? null : { label: "Elim Record", value: record };
};

/**
 * Every highlight the match screen can show.
 * Rank and skills aren't here: the match info endpoint never sends them (only team info does).
 */
export const EXTRACTORS: readonly Extractor[] = [
	winRate,
	averagePoints,
	totalPoints,
	seasonWinRate,
	seasonAwards,
	eliminationRecord,
];

/** All highlights a team has, in extractor order. An extractor that throws on odd data is skipped. */
export function availableHighlights(team: Team, extractors: readonly Extractor[] = EXTRACTORS): Highlight[] {
	return extractors
		.map((extract) => {
			try {
				return extract(team);
			} catch {
				return null;
			}
		})
		.filter((highlight): highlight is Highlight => highlight !== null);
}

/**
 * Fisher-Yates shuffle
 * Returns a new array and leaves the input alone.
 */
export function shuffle<T>(items: readonly T[], random: RandomFn): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		// Math.min guards against a random function that returns exactly 1
		const j = Math.min(i, Math.floor(random() * (i + 1)));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Picks `count` highlights for a team in random order.
 * Always returns exactly `count` items: placeholders when the team has no stats,
 * and empty slots at the end when it has fewer than `count`.
 */
export function pickHighlights(team: Team | null | undefined, count = 2, random: RandomFn = Math.random): Highlight[] {
	const available = team?.Stats ? availableHighlights(team) : [];

	const picked =
		available.length > 0
			? shuffle(available, random).slice(0, count)
			: NO_STATS.slice(0, count).map((placeholder) => ({ ...placeholder }));

	while (picked.length < count) {
		picked.push({ ...EMPTY_SLOT });
	}
	return picked;
}
