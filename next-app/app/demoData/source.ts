/**
 * Source data for the sample tournament.
 *
 * A made-up V5RC high school event in Kansas, frozen partway through qualifications.
 * Team names, numbers and schools are invented; any match with a real team is a coincidence.
 *
 * Data points that are included: who the teams are, what they did before this event,
 * and the qualification schedule with results. Every record, ranking and stat string
 * the app shows is worked out from this in build.ts, so they always agree with each other.
 */

export interface WinLossTie {
	Win: number;
	Loss: number;
	Tie: number;
}

export interface SkillsResult {
	Attempts: number;
	HighScore: number;
}

export interface DemoTeam {
	ID: number;
	Number: string;
	TeamName: string;
	Organization: string | null;
	CityState: string;
	/** Results from earlier events this season, before this one */
	Season: {
		Quali: WinLossTie & { SP: number; AP: number };
		Elim: WinLossTie;
		Awards: string[];
	};
	/** Skills runs at this event */
	Skills: {
		Driver?: SkillsResult;
		Programming?: SkillsResult;
	};
}

export type AllianceColor = "red" | "blue";

export interface DemoMatch {
	MatchNumber: number;
	/** Team numbers on each alliance */
	Red: [string, string];
	Blue: [string, string];
	/** Final scores, and which alliance won the autonomous period. Missing until the match is scored */
	Result?: { Red: number; Blue: number; Auto: AllianceColor | "tie" };
}

export const EVENT_ID = 99001;
export const DIVISION_ID = 1;
export const PROGRAM_ABBREVIATION = "V5RC";

/** The match that has started but isn't scored yet */
export const IN_PROGRESS_MATCH = 23;
/** Matches are scheduled 8 minutes apart, starting at 9:00 AM */
export const FIRST_MATCH_HOUR = 9;
export const MINUTES_BETWEEN_MATCHES = 8;

export const DEMO_TEAMS: DemoTeam[] = [
	// Driver skills only
	{
		ID: 140101,
		Number: "418R",
		TeamName: "Sandhill Cranes",
		Organization: "Sandhill Prep",
		CityState: "Hays, Kansas",
		Season: {
			Quali: { Win: 9, Loss: 15, Tie: 1, SP: 430, AP: 46 },
			Elim: { Win: 0, Loss: 0, Tie: 0 },
			Awards: [],
		},
		Skills: { Driver: { Attempts: 3, HighScore: 19 } },
	},
	{
		ID: 140102,
		Number: "903Z",
		TeamName: "Kilowatt Kids",
		Organization: "Red Brick Middle School",
		CityState: "Salina, Kansas",
		Season: {
			Quali: { Win: 13, Loss: 10, Tie: 1, SP: 540, AP: 80 },
			Elim: { Win: 2, Loss: 3, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 29 },
			Programming: { Attempts: 2, HighScore: 12 },
		},
	},
	{
		ID: 140103,
		Number: "1781H",
		TeamName: "Grain Elevator",
		Organization: "Sandhill Prep",
		CityState: "Hays, Kansas",
		Season: {
			Quali: { Win: 12, Loss: 12, Tie: 1, SP: 505, AP: 70 },
			Elim: { Win: 1, Loss: 3, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 26 },
			Programming: { Attempts: 2, HighScore: 14 },
		},
	},
	{
		ID: 140104,
		Number: "2045P",
		TeamName: "Sunflower Circuit",
		Organization: "Sunflower Ridge High School",
		CityState: "Overland Park, Kansas",
		Season: {
			Quali: { Win: 6, Loss: 18, Tie: 1, SP: 371, AP: 24 },
			Elim: { Win: 0, Loss: 1, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 12 },
			Programming: { Attempts: 1, HighScore: 2 },
		},
	},
	{
		ID: 140105,
		Number: "2297K",
		TeamName: "Static Shock",
		Organization: "Arkansas River High School",
		CityState: "Hutchinson, Kansas",
		Season: {
			Quali: { Win: 15, Loss: 11, Tie: 2, SP: 598, AP: 96 },
			Elim: { Win: 3, Loss: 3, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 30 },
			Programming: { Attempts: 2, HighScore: 15 },
		},
	},
	{
		ID: 140106,
		Number: "3912S",
		TeamName: "Pivot Point",
		Organization: "Meadowview High School",
		CityState: "Olathe, Kansas",
		Season: {
			Quali: { Win: 11, Loss: 13, Tie: 2, SP: 476, AP: 60 },
			Elim: { Win: 1, Loss: 2, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 24 },
			Programming: { Attempts: 1, HighScore: 8 },
		},
	},
	{
		ID: 140107,
		Number: "5430X",
		TeamName: "Turnpike Titans",
		Organization: "Limestone Valley High School",
		CityState: "Topeka, Kansas",
		Season: {
			Quali: { Win: 17, Loss: 10, Tie: 1, SP: 655, AP: 120 },
			Elim: { Win: 5, Loss: 3, Tie: 0 },
			Awards: ["Tournament Champions (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 35 },
			Programming: { Attempts: 3, HighScore: 27 },
		},
	},
	// No organization listed
	{
		ID: 140108,
		Number: "6150W",
		TeamName: "Wheat State Bots",
		Organization: null,
		CityState: "Newton, Kansas",
		Season: {
			Quali: { Win: 10, Loss: 14, Tie: 1, SP: 450, AP: 52 },
			Elim: { Win: 0, Loss: 2, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 22 },
			Programming: { Attempts: 1, HighScore: 6 },
		},
	},
	// Winless so far at this event
	{
		ID: 140109,
		Number: "7263M",
		TeamName: "Gearhead Union",
		Organization: "Meadowview High School",
		CityState: "Olathe, Kansas",
		Season: {
			Quali: { Win: 7, Loss: 18, Tie: 0, SP: 396, AP: 30 },
			Elim: { Win: 0, Loss: 1, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 15 },
			Programming: { Attempts: 1, HighScore: 3 },
		},
	},
	// Strongest team, several awards
	{
		ID: 140110,
		Number: "8204A",
		TeamName: "Prairie Gears",
		Organization: "Sunflower Ridge High School",
		CityState: "Overland Park, Kansas",
		Season: {
			Quali: { Win: 22, Loss: 6, Tie: 1, SP: 812, AP: 170 },
			Elim: { Win: 9, Loss: 3, Tie: 0 },
			Awards: [
				"Excellence Award (VRC/VEXU/VAIRC)",
				"Tournament Champions (VRC/VEXU/VAIRC)",
				"Robot Skills Champion (VRC/VEXU/VAIRC)",
			],
		},
		Skills: {
			Driver: { Attempts: 3, HighScore: 41 },
			Programming: { Attempts: 3, HighScore: 33 },
		},
	},
	// No skills runs yet
	{
		ID: 140111,
		Number: "11229D",
		TeamName: "Brick and Bolt",
		Organization: "Tallgrass High School",
		CityState: "Lenexa, Kansas",
		Season: {
			Quali: { Win: 4, Loss: 20, Tie: 1, SP: 340, AP: 16 },
			Elim: { Win: 0, Loss: 0, Tie: 0 },
			Awards: [],
		},
		Skills: {},
	},
	{
		ID: 140112,
		Number: "13348T",
		TeamName: "Tornado Alley",
		Organization: "Arkansas River High School",
		CityState: "Hutchinson, Kansas",
		Season: {
			Quali: { Win: 8, Loss: 16, Tie: 0, SP: 409, AP: 38 },
			Elim: { Win: 0, Loss: 2, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 17 },
			Programming: { Attempts: 1, HighScore: 4 },
		},
	},
	{
		ID: 140113,
		Number: "14882B",
		TeamName: "Bison Bytes",
		Organization: "Bluestem Academy",
		CityState: "Manhattan, Kansas",
		Season: {
			Quali: { Win: 16, Loss: 9, Tie: 0, SP: 610, AP: 110 },
			Elim: { Win: 4, Loss: 4, Tie: 0 },
			Awards: ["Judges Award (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 3, HighScore: 33 },
			Programming: { Attempts: 1, HighScore: 18 },
		},
	},
	{
		ID: 140114,
		Number: "26604E",
		TeamName: "Night Prairie",
		Organization: "Cottonwood Creek High School",
		CityState: "Wichita, Kansas",
		Season: {
			Quali: { Win: 10, Loss: 15, Tie: 0, SP: 465, AP: 58 },
			Elim: { Win: 2, Loss: 3, Tie: 0 },
			Awards: ["Innovate Award (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 3, HighScore: 23 },
			Programming: { Attempts: 2, HighScore: 10 },
		},
	},
	{
		ID: 140115,
		Number: "31170C",
		TeamName: "Iron Meadowlarks",
		Organization: "Cottonwood Creek High School",
		CityState: "Wichita, Kansas",
		Season: {
			Quali: { Win: 19, Loss: 8, Tie: 0, SP: 690, AP: 140 },
			Elim: { Win: 6, Loss: 4, Tie: 0 },
			Awards: ["Design Award (VRC/VEXU/VAIRC)", "Tournament Finalists (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 3, HighScore: 38 },
			Programming: { Attempts: 2, HighScore: 24 },
		},
	},
	// Winless so far at this event
	{
		ID: 140116,
		Number: "38851J",
		TeamName: "Red Brick Robotics",
		Organization: "Red Brick Middle School",
		CityState: "Salina, Kansas",
		Season: {
			Quali: { Win: 6, Loss: 19, Tie: 0, SP: 380, AP: 26 },
			Elim: { Win: 0, Loss: 0, Tie: 0 },
			Awards: [],
		},
		Skills: { Driver: { Attempts: 1, HighScore: 13 } },
	},
	{
		ID: 140117,
		Number: "45116F",
		TeamName: "Torque Wrench",
		Organization: "Cimarron Trail High School",
		CityState: "Garden City, Kansas",
		Season: {
			Quali: { Win: 12, Loss: 13, Tie: 0, SP: 530, AP: 74 },
			Elim: { Win: 2, Loss: 2, Tie: 0 },
			Awards: ["Sportsmanship Award (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 3, HighScore: 27 },
			Programming: { Attempts: 1, HighScore: 9 },
		},
	},
	{
		ID: 140118,
		Number: "59007B",
		TeamName: "Limestone Logic",
		Organization: "Limestone Valley High School",
		CityState: "Topeka, Kansas",
		Season: {
			Quali: { Win: 8, Loss: 17, Tie: 0, SP: 421, AP: 40 },
			Elim: { Win: 1, Loss: 2, Tie: 0 },
			Awards: ["Energy Award (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 18 },
			Programming: { Attempts: 1, HighScore: 5 },
		},
	},
	{
		ID: 140119,
		Number: "60418V",
		TeamName: "Tumbleweed Tech",
		Organization: "Cimarron Trail High School",
		CityState: "Garden City, Kansas",
		Season: {
			Quali: { Win: 5, Loss: 20, Tie: 0, SP: 352, AP: 20 },
			Elim: { Win: 0, Loss: 0, Tie: 0 },
			Awards: [],
		},
		Skills: { Driver: { Attempts: 1, HighScore: 10 } },
	},
	{
		ID: 140120,
		Number: "67021D",
		TeamName: "Flint Hills Forge",
		Organization: "Flint Hills Robotics Club",
		CityState: "Emporia, Kansas",
		Season: {
			Quali: { Win: 14, Loss: 12, Tie: 0, SP: 571, AP: 92 },
			Elim: { Win: 4, Loss: 2, Tie: 0 },
			Awards: ["Think Award (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 3, HighScore: 31 },
			Programming: { Attempts: 3, HighScore: 21 },
		},
	},
	{
		ID: 140121,
		Number: "77340A",
		TeamName: "Plains Drifters",
		Organization: "Tallgrass High School",
		CityState: "Lenexa, Kansas",
		Season: {
			Quali: { Win: 11, Loss: 14, Tie: 0, SP: 498, AP: 66 },
			Elim: { Win: 3, Loss: 3, Tie: 0 },
			Awards: ["Tournament Finalists (VRC/VEXU/VAIRC)"],
		},
		Skills: {
			Driver: { Attempts: 3, HighScore: 25 },
			Programming: { Attempts: 2, HighScore: 11 },
		},
	},
	{
		ID: 140122,
		Number: "82711G",
		TeamName: "Cottonwood Coders",
		Organization: "Cottonwood Creek High School",
		CityState: "Wichita, Kansas",
		Season: {
			Quali: { Win: 9, Loss: 16, Tie: 0, SP: 442, AP: 48 },
			Elim: { Win: 1, Loss: 2, Tie: 0 },
			Awards: [],
		},
		Skills: {
			Driver: { Attempts: 2, HighScore: 20 },
			Programming: { Attempts: 2, HighScore: 7 },
		},
	},
	// Winless so far at this event
	{
		ID: 140123,
		Number: "85536L",
		TeamName: "Late Bloomers",
		Organization: "Flint Hills Robotics Club",
		CityState: "Emporia, Kansas",
		Season: {
			Quali: { Win: 3, Loss: 21, Tie: 0, SP: 318, AP: 10 },
			Elim: { Win: 0, Loss: 0, Tie: 0 },
			Awards: [],
		},
		Skills: { Driver: { Attempts: 1, HighScore: 8 } },
	},
	// Rookie team: no season record before this event
	{
		ID: 140124,
		Number: "94205C",
		TeamName: "Copper Kettle",
		Organization: "Bluestem Academy",
		CityState: "Manhattan, Kansas",
		Season: {
			Quali: { Win: 0, Loss: 0, Tie: 0, SP: 0, AP: 0 },
			Elim: { Win: 0, Loss: 0, Tie: 0 },
			Awards: [],
		},
		Skills: { Driver: { Attempts: 2, HighScore: 14 } },
	},
];

/**
 * The qualification schedule: 24 teams, 6 matches each, 2v2.
 * No team plays two matches in a row, and no pair of teams is partnered twice.
 */
export const DEMO_MATCHES: DemoMatch[] = [
	{ MatchNumber: 1, Red: ["2297K", "26604E"], Blue: ["903Z", "67021D"], Result: { Red: 49, Blue: 48, Auto: "red" } },
	{ MatchNumber: 2, Red: ["11229D", "2045P"], Blue: ["5430X", "1781H"], Result: { Red: 36, Blue: 47, Auto: "blue" } },
	// Q3: Blowout
	{ MatchNumber: 3, Red: ["31170C", "8204A"], Blue: ["38851J", "7263M"], Result: { Red: 94, Blue: 11, Auto: "red" } },
	{ MatchNumber: 4, Red: ["77340A", "418R"], Blue: ["6150W", "59007B"], Result: { Red: 37, Blue: 45, Auto: "blue" } },
	{ MatchNumber: 5, Red: ["82711G", "94205C"], Blue: ["45116F", "85536L"], Result: { Red: 37, Blue: 30, Auto: "red" } },
	{ MatchNumber: 6, Red: ["60418V", "13348T"], Blue: ["3912S", "14882B"], Result: { Red: 27, Blue: 46, Auto: "blue" } },
	// Q7: Autonomous won by the losing alliance
	{ MatchNumber: 7, Red: ["8204A", "903Z"], Blue: ["6150W", "67021D"], Result: { Red: 60, Blue: 61, Auto: "red" } },
	{ MatchNumber: 8, Red: ["5430X", "94205C"], Blue: ["77340A", "38851J"], Result: { Red: 42, Blue: 37, Auto: "red" } },
	{ MatchNumber: 9, Red: ["1781H", "26604E"], Blue: ["418R", "3912S"], Result: { Red: 53, Blue: 58, Auto: "blue" } },
	{ MatchNumber: 10, Red: ["2045P", "85536L"], Blue: ["11229D", "60418V"], Result: { Red: 27, Blue: 31, Auto: "blue" } },
	// Q11: Autonomous won by the losing alliance
	{ MatchNumber: 11, Red: ["59007B", "82711G"], Blue: ["14882B", "13348T"], Result: { Red: 56, Blue: 41, Auto: "blue" } },
	{ MatchNumber: 12, Red: ["31170C", "2297K"], Blue: ["45116F", "7263M"], Result: { Red: 70, Blue: 42, Auto: "red" } },
	{ MatchNumber: 13, Red: ["5430X", "26604E"], Blue: ["2045P", "6150W"], Result: { Red: 47, Blue: 32, Auto: "red" } },
	{ MatchNumber: 14, Red: ["8204A", "38851J"], Blue: ["77340A", "903Z"], Result: { Red: 48, Blue: 61, Auto: "blue" } },
	{ MatchNumber: 15, Red: ["11229D", "7263M"], Blue: ["94205C", "45116F"], Result: { Red: 27, Blue: 49, Auto: "blue" } },
	// Q16: Tie
	{ MatchNumber: 16, Red: ["2297K", "3912S"], Blue: ["31170C", "59007B"], Result: { Red: 54, Blue: 54, Auto: "tie" } },
	// Q17: Autonomous won by the losing alliance
	{ MatchNumber: 17, Red: ["82711G", "67021D"], Blue: ["60418V", "1781H"], Result: { Red: 52, Blue: 32, Auto: "blue" } },
	{ MatchNumber: 18, Red: ["13348T", "85536L"], Blue: ["14882B", "418R"], Result: { Red: 22, Blue: 46, Auto: "blue" } },
	{ MatchNumber: 19, Red: ["82711G", "77340A"], Blue: ["11229D", "2297K"], Result: { Red: 53, Blue: 43, Auto: "red" } },
	{ MatchNumber: 20, Red: ["13348T", "2045P"], Blue: ["59007B", "85536L"], Result: { Red: 35, Blue: 32, Auto: "red" } },
	{ MatchNumber: 21, Red: ["26604E", "8204A"], Blue: ["60418V", "67021D"], Result: { Red: 57, Blue: 40, Auto: "red" } },
	{ MatchNumber: 22, Red: ["418R", "6150W"], Blue: ["3912S", "1781H"], Result: { Red: 53, Blue: 56, Auto: "blue" } },
	// Not scored yet. Q23 has started; the rest are upcoming
	{ MatchNumber: 23, Red: ["31170C", "14882B"], Blue: ["45116F", "903Z"] },
	{ MatchNumber: 24, Red: ["38851J", "5430X"], Blue: ["94205C", "7263M"] },
	{ MatchNumber: 25, Red: ["14882B", "2045P"], Blue: ["31170C", "13348T"] },
	{ MatchNumber: 26, Red: ["45116F", "67021D"], Blue: ["60418V", "8204A"] },
	{ MatchNumber: 27, Red: ["82711G", "7263M"], Blue: ["418R", "38851J"] },
	{ MatchNumber: 28, Red: ["85536L", "77340A"], Blue: ["5430X", "903Z"] },
	{ MatchNumber: 29, Red: ["6150W", "26604E"], Blue: ["3912S", "94205C"] },
	{ MatchNumber: 30, Red: ["2297K", "59007B"], Blue: ["11229D", "1781H"] },
	{ MatchNumber: 31, Red: ["60418V", "38851J"], Blue: ["26604E", "94205C"] },
	{ MatchNumber: 32, Red: ["3912S", "8204A"], Blue: ["11229D", "418R"] },
	{ MatchNumber: 33, Red: ["1781H", "14882B"], Blue: ["31170C", "45116F"] },
	{ MatchNumber: 34, Red: ["59007B", "2045P"], Blue: ["77340A", "7263M"] },
	{ MatchNumber: 35, Red: ["13348T", "6150W"], Blue: ["82711G", "2297K"] },
	{ MatchNumber: 36, Red: ["5430X", "67021D"], Blue: ["85536L", "903Z"] },
];
