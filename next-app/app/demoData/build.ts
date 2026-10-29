/**
 * Builds API-shaped responses from the demo source data.
 *
 * Each builder follows the matching C# class on master (VEXEmcee.Logic/InternalLogic),
 * including its section names, labels and format strings, so pages get exactly what
 * the real API sends. Two known backend bugs are left out on purpose:
 * - match info adds red team 1's "Overall WLT" with an extra "All Matches: " prefix
 * - match info adds up blue team 2's points from blue team 1's matches
 */
import { addRecords, average, fixed1, formatWLT, matchCount, percent1, winPercentage } from "./format";
import {
	DEMO_MATCHES,
	DEMO_TEAMS,
	DIVISION_ID,
	EVENT_ID,
	FIRST_MATCH_HOUR,
	IN_PROGRESS_MATCH,
	MINUTES_BETWEEN_MATCHES,
	PROGRAM_ABBREVIATION,
} from "./source";
import type { AllianceColor, DemoMatch, DemoTeam, WinLossTie } from "./source";

type SectionHeader = VEXEmcee.API.Objects.Display.SectionHeader;

// Ranking points, simplified from the game manual:
// WP: 2 for a win, 1 for a tie. AP: 8 to the alliance that wins autonomous, 4 each on a tie.
// SP: the losing alliance's score, given to both alliances.
const WP_PER_WIN = 2;
const WP_PER_TIE = 1;
const AP_PER_AUTO_WIN = 8;
const AP_PER_AUTO_TIE = 4;

// Copied from Helpers/Award.cs IsJudgedAward: an award is judged if its name contains one of these
const JUDGED_AWARD_NAMES = [
	"Excellence Award",
	"Design Award",
	"Judges Award",
	"Innovate Award",
	"Think Award",
	"Amaze Award",
	"Build Award",
	"Create Award",
	"Inspire Award",
	"Sportsmanship Award",
	"Energy Award",
];

const isJudgedAward = (awardName: string): boolean =>
	JUDGED_AWARD_NAMES.some((name) => awardName.toLowerCase().includes(name.toLowerCase()));

// ============================================
// LOOKUPS
// ============================================

const teamByNumber = new Map(DEMO_TEAMS.map((team) => [team.Number, team]));

const getTeam = (teamNumber: string): DemoTeam => {
	const team = teamByNumber.get(teamNumber);
	if (!team) {
		throw new Error(`Demo match refers to unknown team ${teamNumber}`);
	}
	return team;
};

/** Same layout as the API's composite keys: event~division~round~instance~match number */
export const matchKey = (match: DemoMatch): string =>
	`${EVENT_ID}~${DIVISION_ID}~Qualification~1~${match.MatchNumber}`;

const isScored = (match: DemoMatch): boolean => match.Result !== undefined;

const allianceOf = (match: DemoMatch, teamNumber: string): AllianceColor | null => {
	if (match.Red.includes(teamNumber)) return "red";
	if (match.Blue.includes(teamNumber)) return "blue";
	return null;
};

/** Today at 9:00 AM local time plus 8 minutes per match, so the times read the same for every visitor */
const scheduledTime = (match: DemoMatch): string => {
	const time = new Date();
	time.setHours(FIRST_MATCH_HOUR, (match.MatchNumber - 1) * MINUTES_BETWEEN_MATCHES, 0, 0);
	return time.toISOString();
};

/** The API's team location: "Organization - City, State". With no organization it starts with " - " */
const teamLocation = (team: DemoTeam): string => `${team.Organization ?? ""} - ${team.CityState}`;

// ============================================
// SORTING (copies Helpers/Team.cs and MatchList/V5RC.cs)
// ============================================

/** Team numbers sort by their number part, then their letter: 418R, 903Z, 1781H ... */
const parseTeamNumber = (teamNumber: string): [number, string] => {
	const parts = /^(\d+)([A-Z])$/.exec(teamNumber);
	return parts ? [Number(parts[1]), parts[2]] : [Number.MAX_SAFE_INTEGER, ""];
};

const compareTeamNumbers = (a: DemoTeam, b: DemoTeam): number => {
	const [aNumber, aLetter] = parseTeamNumber(a.Number);
	const [bNumber, bLetter] = parseTeamNumber(b.Number);
	if (aNumber !== bNumber) return aNumber - bNumber;
	return aLetter < bLetter ? -1 : aLetter > bLetter ? 1 : 0;
};

const SORTED_TEAMS = [...DEMO_TEAMS].sort(compareTeamNumbers);
const numberSortOrder = new Map(SORTED_TEAMS.map((team, index) => [team.ID, index]));

/**
 * The server's match order: the 3 most recently scored matches first, then the upcoming ones,
 * then the older scored matches. If nothing (or almost nothing) is scored yet, or everything is,
 * it's plain match order.
 */
export const sortMatches = (matches: DemoMatch[]): DemoMatch[] => {
	const sorted = [...matches].sort((a, b) => a.MatchNumber - b.MatchNumber);
	let lastScored = -1;
	sorted.forEach((match, index) => {
		if (isScored(match)) lastScored = index;
	});
	if (lastScored === -1 || lastScored < 3 || lastScored === sorted.length - 1) {
		return sorted;
	}
	return [
		...sorted.slice(lastScored - 2, lastScored + 1),
		...sorted.slice(lastScored + 1),
		...sorted.slice(0, lastScored - 2),
	];
};

const SORTED_MATCHES = sortMatches(DEMO_MATCHES);

// ============================================
// STATS AT THIS EVENT
// ============================================

interface QualiStats extends WinLossTie {
	WP: number;
	SP: number;
	AP: number;
}

interface EventStats {
	Quali: QualiStats;
	PointsScored: number;
	ScoredMatches: number;
	ByColor: Record<AllianceColor, WinLossTie>;
}

const emptyRecord = (): WinLossTie => ({ Win: 0, Loss: 0, Tie: 0 });

const buildEventStats = (team: DemoTeam): EventStats => {
	const stats: EventStats = {
		Quali: { ...emptyRecord(), WP: 0, SP: 0, AP: 0 },
		PointsScored: 0,
		ScoredMatches: 0,
		ByColor: { red: emptyRecord(), blue: emptyRecord() },
	};

	for (const match of DEMO_MATCHES) {
		const color = allianceOf(match, team.Number);
		if (!color || !match.Result) continue;

		const ownScore = color === "red" ? match.Result.Red : match.Result.Blue;
		const otherScore = color === "red" ? match.Result.Blue : match.Result.Red;
		const outcome: keyof WinLossTie = ownScore > otherScore ? "Win" : ownScore < otherScore ? "Loss" : "Tie";

		stats.ScoredMatches++;
		stats.PointsScored += ownScore;
		stats.Quali[outcome]++;
		stats.ByColor[color][outcome]++;
		stats.Quali.SP += Math.min(ownScore, otherScore);
		if (outcome === "Win") stats.Quali.WP += WP_PER_WIN;
		if (outcome === "Tie") stats.Quali.WP += WP_PER_TIE;
		if (match.Result.Auto === color) stats.Quali.AP += AP_PER_AUTO_WIN;
		if (match.Result.Auto === "tie") stats.Quali.AP += AP_PER_AUTO_TIE;
	}

	return stats;
};

const eventStats = new Map(DEMO_TEAMS.map((team) => [team.Number, buildEventStats(team)]));

const getEventStats = (team: DemoTeam): EventStats => eventStats.get(team.Number)!;

/** Qualification rankings: WP, then AP, then SP. Teams that haven't played yet have no rank */
const qualiRank = new Map<string, number>(
	DEMO_TEAMS.filter((team) => getEventStats(team).ScoredMatches > 0)
		.sort((a, b) => {
			const aStats = getEventStats(a).Quali;
			const bStats = getEventStats(b).Quali;
			return bStats.WP - aStats.WP || bStats.AP - aStats.AP || bStats.SP - aStats.SP || compareTeamNumbers(a, b);
		})
		.map((team, index) => [team.Number, index + 1]),
);

const seasonWP = (record: WinLossTie): number => record.Win * WP_PER_WIN + record.Tie * WP_PER_TIE;

// ============================================
// SECTIONS
// ============================================

const pointsScoredDisplay = (stats: EventStats) => ({
	SectionLabel: "Points Scored",
	SectionData: [
		`Total: ${stats.PointsScored} points`,
		`Average per match: ${fixed1(average(stats.PointsScored, stats.ScoredMatches))} points`,
	],
});

const rankingPointsData = (WP: number, SP: number, AP: number, matches: number): string[] => [
	`Total: ${WP} WP - ${SP} SP - ${AP} AP`,
	`Average per match: ${fixed1(average(WP, matches))} WP - ${fixed1(average(SP, matches))} SP - ${fixed1(average(AP, matches))} AP`,
];

/** Team info sections (TeamInfo/V5RC.cs) */
const teamInfoSections = (team: DemoTeam): SectionHeader[] => {
	const stats = getEventStats(team);
	const rank = qualiRank.get(team.Number);

	const skills: string[] = [];
	if (team.Skills.Driver) {
		skills.push(`Driver: ${team.Skills.Driver.Attempts} attempts, ${team.Skills.Driver.HighScore} high score`);
	}
	if (team.Skills.Programming) {
		skills.push(
			`Programming: ${team.Skills.Programming.Attempts} attempts, ${team.Skills.Programming.HighScore} high score`,
		);
	}

	// "This Season" combines the earlier events with this one
	const seasonQuali = addRecords(team.Season.Quali, stats.Quali);
	const seasonAll = addRecords(addRecords(team.Season.Quali, team.Season.Elim), stats.Quali);

	return [
		{
			Name: "This Event",
			Order: 0,
			Display: [
				{
					SectionLabel: "Qualification W-L-T",
					SectionData: [formatWLT(stats.Quali), `${percent1(winPercentage(stats.Quali))} Win Rate`],
				},
				{
					SectionLabel: "Qualifications Ranking",
					SectionData: [rank !== undefined ? `#${rank}` : "N/A"],
				},
				{
					SectionLabel: "WP-SP-AP",
					SectionData: rankingPointsData(stats.Quali.WP, stats.Quali.SP, stats.Quali.AP, matchCount(stats.Quali)),
				},
				{ SectionLabel: "Skills Results", SectionData: skills },
				pointsScoredDisplay(stats),
			],
		},
		{
			Name: "This Season (including this event)",
			Order: 1,
			Display: [
				{
					SectionLabel: "W-L-T",
					SectionData: [formatWLT(seasonAll), `${percent1(winPercentage(seasonAll))} Win Rate`],
				},
				{
					SectionLabel: "WP-SP-AP",
					SectionData: rankingPointsData(
						seasonWP(team.Season.Quali) + stats.Quali.WP,
						team.Season.Quali.SP + stats.Quali.SP,
						team.Season.Quali.AP + stats.Quali.AP,
						matchCount(seasonQuali),
					),
				},
			],
		},
	];
};

/** Stats for one team on the match screen (MatchInfo/V5RC.cs PopulateStatsForTeams) */
const matchTeamStats = (team: DemoTeam, color: AllianceColor): SectionHeader[] => {
	const stats = getEventStats(team);
	const seasonAll = addRecords(team.Season.Quali, team.Season.Elim);
	const seasonLine = (label: string, record: WinLossTie) =>
		`${label}: ${formatWLT(record)} - ${percent1(winPercentage(record))} Win Pct.`;

	const season: SectionHeader = {
		Name: "Season Stats Entering This Tournament",
		Order: 1,
		Display: [
			{
				SectionLabel: "WLT",
				SectionData: [
					seasonLine("All Matches", seasonAll),
					seasonLine("Qualification Matches", team.Season.Quali),
					seasonLine("Elimination Matches", team.Season.Elim),
				],
			},
		],
	};
	if (team.Season.Awards.length > 0) {
		season.Display.push({
			SectionLabel: "Awards",
			SectionData: [
				`${team.Season.Awards.length} Total Awards`,
				`${team.Season.Awards.filter(isJudgedAward).length} Judged Awards`,
			],
		});
	}

	// Only qualification matches so far, so the overall record is the qualification record
	const colorRecord = stats.ByColor[color];
	const colorTotal = matchCount(colorRecord);
	const colorName = color === "red" ? "Red" : "Blue";

	const thisEvent: SectionHeader = {
		Name: "This Event",
		Order: 2,
		Display: [
			{
				SectionLabel: "Overall WLT (Qualification + Elim.)",
				SectionData: [formatWLT(stats.Quali), `${percent1(winPercentage(stats.Quali))} Win Pct.`],
			},
			{
				SectionLabel: "Qualification WLT",
				SectionData: [formatWLT(stats.Quali), `${percent1(winPercentage(stats.Quali))} Win Pct.`],
			},
			pointsScoredDisplay(stats),
			{
				// Unlike the other percentages, this one doesn't count ties as half a win
				SectionLabel: `As ${colorName} Alliance WLT`,
				SectionData: [
					`${formatWLT(colorRecord)} - ${colorTotal} Total`,
					`${percent1(average(colorRecord.Win, colorTotal))} Win Pct.`,
				],
			},
		],
	};

	return [season, thisEvent];
};

const matchTeam = (teamNumber: string, color: AllianceColor): VEXEmcee.API.Objects.MatchInfo.V5RCTeam => {
	const team = getTeam(teamNumber);
	return {
		ID: team.ID,
		SimpleStat: null,
		TeamLocator: teamLocation(team),
		TeamName: team.TeamName,
		TeamNumber: team.Number,
		Stats: matchTeamStats(team, color),
	};
};

// ============================================
// RESPONSES
// ============================================

const success = { Success: true, ErrorMessage: null, EventStatsLoading: false, ProgramAbbreviation: PROGRAM_ABBREVIATION };

export const buildTeamList = (): VEXEmcee.API.Responses.GetTeamListResponse<VEXEmcee.API.Objects.TeamList.V5RC> => ({
	...success,
	Teams: SORTED_TEAMS.map((team) => ({
		ID: team.ID,
		InDivision: true,
		Number: team.Number,
		NumberSortOrder: numberSortOrder.get(team.ID)!,
		TeamName: team.TeamName,
		EventWLT: formatWLT(getEventStats(team).Quali),
		QualiRank: qualiRank.get(team.Number) ?? null,
	})),
});

export const buildTeamInfo = (teamId: number): VEXEmcee.API.Responses.GetTeamInfoResponse => {
	const team = DEMO_TEAMS.find((t) => t.ID === teamId);
	if (!team) {
		return { Success: false, ErrorMessage: "Team not found", ProgramAbbreviation: PROGRAM_ABBREVIATION };
	}

	// Previous and next follow team number order, and wrap around at the ends like the server does
	const index = numberSortOrder.get(team.ID)!;
	const count = SORTED_TEAMS.length;

	return {
		...success,
		TeamInfo: {
			ID: team.ID,
			Location: teamLocation(team),
			Number: team.Number,
			TeamName: team.TeamName,
			PreviousTeamID: SORTED_TEAMS[(index - 1 + count) % count].ID,
			NextTeamID: SORTED_TEAMS[(index + 1) % count].ID,
			Sections: teamInfoSections(team),
		},
	};
};

export const buildMatchList = (): VEXEmcee.API.Responses.GetMatchListResponse<VEXEmcee.API.Objects.MatchList.V5RC> => ({
	...success,
	Matches: SORTED_MATCHES.map((match, index) => {
		const red = match.Result?.Red ?? 0;
		const blue = match.Result?.Blue ?? 0;
		const scored = isScored(match);
		return {
			Key: matchKey(match),
			MatchName: `Qualifier #${match.MatchNumber}`,
			SortOrder: index,
			Scored: scored,
			Red: { Score: red, TeamNumbers: [...match.Red] },
			Blue: { Score: blue, TeamNumbers: [...match.Blue] },
			RedWin: scored && red > blue,
			BlueWin: scored && blue > red,
			Tie: scored && red === blue,
			Scheduled: scheduledTime(match),
			Started: match.MatchNumber <= IN_PROGRESS_MATCH ? scheduledTime(match) : undefined,
		};
	}),
});

export const buildMatchInfo = (key: string): VEXEmcee.API.Responses.GetMatchInfoResponse<VEXEmcee.API.Objects.MatchInfo.V5RC> => {
	const index = SORTED_MATCHES.findIndex((match) => matchKey(match) === key);
	if (index === -1) {
		return { Success: false, ErrorMessage: "The specified match does not exist.", ProgramAbbreviation: PROGRAM_ABBREVIATION };
	}

	const match = SORTED_MATCHES[index];
	const red = match.Result?.Red ?? 0;
	const blue = match.Result?.Blue ?? 0;
	const scored = isScored(match);

	return {
		...success,
		MatchInfo: {
			MatchInstance: 1,
			MatchNumber: match.MatchNumber,
			MatchRound: 2, // MatchRoundType.Qualification
			Scored: scored,
			// Previous and next follow the match list order, and stop at the ends
			PreviousMatchKey: index > 0 ? matchKey(SORTED_MATCHES[index - 1]) : null,
			NextMatchKey: index < SORTED_MATCHES.length - 1 ? matchKey(SORTED_MATCHES[index + 1]) : null,
			Red: { Score: red, Teams: match.Red.map((teamNumber) => matchTeam(teamNumber, "red")) },
			Blue: { Score: blue, Teams: match.Blue.map((teamNumber) => matchTeam(teamNumber, "blue")) },
			RedWin: scored && red > blue,
			BlueWin: scored && blue > red,
			Tie: scored && red === blue,
		},
	};
};
