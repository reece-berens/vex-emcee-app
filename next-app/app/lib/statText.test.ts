import { describe, expect, it } from "vitest";
import { buildMatchInfo, buildTeamInfo, matchKey } from "../demoData/build";
import { DEMO_MATCHES, DEMO_TEAMS } from "../demoData/source";
import type { DemoMatch } from "../demoData/source";
import { parsePercent, parsePoints, parseRankingPoints, parseRecord, parseSkill } from "./statText";

// Every input below is in the exact format the backend's C# sends (see demoData/build.ts)

describe("parseRecord", () => {
	it("reads a bare record", () => {
		expect(parseRecord("2-0-1")).toBe("2-0-1");
	});

	it("reads a record followed by a match count", () => {
		expect(parseRecord("2-0-0 - 2 Total")).toBe("2-0-0");
	});

	it("reads a record after a label", () => {
		expect(parseRecord("All Matches: 25-12-0 - 67.6% Win Pct.")).toBe("25-12-0");
		expect(parseRecord("Elimination Matches: 6-4-0 - 60.0% Win Pct.")).toBe("6-4-0");
	});

	it("keeps multi-digit numbers whole", () => {
		expect(parseRecord("21-11-1")).toBe("21-11-1");
	});

	it("returns null when there's no record", () => {
		expect(parseRecord("#7")).toBeNull();
		expect(parseRecord("Total: 4 WP - 159 SP - 24 AP")).toBeNull();
		expect(parseRecord("")).toBeNull();
		expect(parseRecord(undefined)).toBeNull();
		expect(parseRecord(null)).toBeNull();
	});
});

describe("parsePercent", () => {
	it("reads both suffixes the backend uses", () => {
		expect(parsePercent("83.3% Win Pct.")).toBe("83.3");
		expect(parsePercent("100.0% Win Rate")).toBe("100.0");
	});

	it("keeps zero, so callers can decide what zero means", () => {
		expect(parsePercent("0.0% Win Pct.")).toBe("0.0");
	});

	it("reads the percentage after a record", () => {
		expect(parsePercent("All Matches: 25-12-0 - 67.6% Win Pct.")).toBe("67.6");
	});

	it("returns null when there's no percent sign", () => {
		expect(parsePercent("Average per match: 72.7 points")).toBeNull();
		expect(parsePercent(undefined)).toBeNull();
	});
});

describe("parsePoints", () => {
	it("reads the total and the average lines", () => {
		expect(parsePoints("Total: 218 points")).toBe("218");
		expect(parsePoints("Average per match: 72.7 points")).toBe("72.7");
	});

	it("reads the singular and ignores case", () => {
		expect(parsePoints("Total: 1 point")).toBe("1");
		expect(parsePoints("Total: 40 Points")).toBe("40");
	});

	it("returns null when there's no points value", () => {
		expect(parsePoints("Total: 4 WP - 159 SP - 24 AP")).toBeNull();
		expect(parsePoints("")).toBeNull();
		expect(parsePoints(undefined)).toBeNull();
	});
});

describe("parseRankingPoints", () => {
	it("reads the total and the average lines", () => {
		expect(parseRankingPoints("Total: 4 WP - 159 SP - 24 AP")).toEqual({ wp: "4", sp: "159", ap: "24" });
		expect(parseRankingPoints("Average per match: 1.3 WP - 53.0 SP - 8.0 AP")).toEqual({
			wp: "1.3",
			sp: "53.0",
			ap: "8.0",
		});
	});

	it("returns null for other lines", () => {
		expect(parseRankingPoints("Total: 218 points")).toBeNull();
		expect(parseRankingPoints(undefined)).toBeNull();
	});
});

describe("parseSkill", () => {
	it("reads both kinds of run", () => {
		expect(parseSkill("Driver: 3 attempts, 38 high score")).toEqual({ type: "Driver", attempts: "3", highScore: "38" });
		expect(parseSkill("Programming: 2 attempts, 24 high score")).toEqual({
			type: "Programming",
			attempts: "2",
			highScore: "24",
		});
	});

	it("reads one attempt, with or without the s", () => {
		// The backend always writes "attempts"
		expect(parseSkill("Driver: 1 attempts, 13 high score")?.attempts).toBe("1");
		expect(parseSkill("Driver: 1 attempt, 13 high score")?.attempts).toBe("1");
	});

	it("returns null for other lines", () => {
		expect(parseSkill("Total: 4 WP - 159 SP - 24 AP")).toBeNull();
		expect(parseSkill("Autonomous: 2 attempts, 10 high score")).toBeNull();
		expect(parseSkill(undefined)).toBeNull();
	});
});

// Every line in the demo data, through the parser its page uses for that label
type Sections = VEXEmcee.API.Objects.Display.SectionHeader[];
type Rule = ((data: string[]) => boolean) | null;

const recordAndPercent = (data: string[]) => parseRecord(data[0]) !== null && parsePercent(data[1]) !== null;
const everyLine = (parse: (line: string) => unknown) => (data: string[]) => data.every((line) => parse(line) !== null);

// null: shown as it comes, or read with its own regex in the page
const TEAM_INFO_RULES: Record<string, Rule> = {
	"Qualification W-L-T": recordAndPercent,
	"W-L-T": recordAndPercent,
	"Qualifications Ranking": null,
	"WP-SP-AP": everyLine(parseRankingPoints),
	"Skills Results": everyLine(parseSkill),
	"Points Scored": everyLine(parsePoints),
};

const MATCH_INFO_RULES: Record<string, Rule> = {
	"Overall WLT (Qualification + Elim.)": recordAndPercent,
	"Qualification WLT": recordAndPercent,
	"As Red Alliance WLT": recordAndPercent,
	"As Blue Alliance WLT": recordAndPercent,
	WLT: everyLine((line) => parseRecord(line) && parsePercent(line)),
	"Points Scored": everyLine(parsePoints),
	Awards: null,
};

/** One message per line that doesn't parse, or label with no rule */
const findProblems = (owner: string, sections: Sections, rules: Record<string, Rule>): string[] =>
	sections.flatMap((section) =>
		section.Display.flatMap((display) => {
			const rule = rules[display.SectionLabel];
			if (rule === undefined) return [`${owner}: no rule for "${display.SectionLabel}"`];
			if (rule === null || rule(display.SectionData)) return [];
			return [`${owner}, ${display.SectionLabel}: ${JSON.stringify(display.SectionData)}`];
		}),
	);

describe("every line in the demo data", () => {
	const teamSections = (teamId: number) => {
		const info = buildTeamInfo(teamId).TeamInfo;
		if (!info) throw new Error(`The demo has no team info for team ${teamId}`);
		return info.Sections;
	};

	const matchTeams = (match: DemoMatch) => {
		const info = buildMatchInfo(matchKey(match)).MatchInfo;
		if (!info) throw new Error(`The demo has no match info for Q${match.MatchNumber}`);
		return [...info.Red.Teams, ...info.Blue.Teams];
	};

	it("parses on the team page", () => {
		const problems = DEMO_TEAMS.flatMap((team) => findProblems(team.Number, teamSections(team.ID), TEAM_INFO_RULES));
		expect(problems).toEqual([]);
	});

	it("parses on the match page", () => {
		const problems = DEMO_MATCHES.flatMap((match) =>
			matchTeams(match).flatMap((team) =>
				findProblems(`Q${match.MatchNumber} ${team.TeamNumber}`, team.Stats, MATCH_INFO_RULES),
			),
		);
		expect(problems).toEqual([]);
	});

	it("still has a team with only one kind of skills run", () => {
		const sections = teamSections(140101); // 418R
		const skills = sections[0].Display.find((display) => display.SectionLabel === "Skills Results");
		expect(skills?.SectionData).toEqual(["Driver: 3 attempts, 19 high score"]);
	});
});
