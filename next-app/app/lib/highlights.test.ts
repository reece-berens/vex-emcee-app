import { describe, expect, it } from "vitest";
import { buildMatchInfo } from "../demoData/build";
import { DIVISION_ID, EVENT_ID } from "../demoData/source";
import { availableHighlights, pickHighlights, shuffle } from "./highlights";
import type { RandomFn } from "./highlights";

type Team = VEXEmcee.API.Objects.MatchInfo.V5RCTeam;

/** Q3: 31170C and 8204A (red, 94) against 38851J and 7263M (blue, 11) */
const q3 = buildMatchInfo(`${EVENT_ID}~${DIVISION_ID}~Qualification~1~3`);
if (!q3.Success || !q3.MatchInfo) throw new Error("Demo data is missing Q3");
const [ironMeadowlarks, prairieGears] = q3.MatchInfo.Red.Teams;
const [redBrick] = q3.MatchInfo.Blue.Teams;

/** A team built by hand, for shapes the demo data doesn't have */
const makeTeam = (stats: Team["Stats"]): Team => ({
	ID: 1,
	SimpleStat: "",
	TeamLocator: "",
	TeamName: "Test Team",
	TeamNumber: "1A",
	Stats: stats,
});

/** Steps through the given numbers, then starts over */
const sequence = (...values: number[]): RandomFn => {
	let index = 0;
	return () => values[index++ % values.length];
};

describe("availableHighlights with demo data", () => {
	// 31170C in source.ts:
	// - Q3 94-11 (win), Q12 70-42 (win), Q16 54-54 (tie): 2-0-1, win rate (2 + 0.5) / 3 = 83.3%
	// - 94 + 70 + 54 = 218 points, 218 / 3 = 72.7 a match
	// - season: quals 19-8-0 plus elims 6-4-0 = 25-12-0, 25 / 37 = 67.6%
	// - 2 awards listed
	it("reads every highlight for a team that has all of them", () => {
		expect(availableHighlights(ironMeadowlarks)).toEqual([
			{ label: "Win Rate", value: "83.3%" },
			{ label: "Avg Points", value: "72.7" },
			{ label: "Total Points", value: "218" },
			{ label: "Season Win%", value: "67.6%" },
			{ label: "Awards", value: "2" },
			{ label: "Elim Record", value: "6-4-0" },
		]);
	});

	it("reads a second team the same way", () => {
		expect(availableHighlights(prairieGears).map((h) => h.value)).toEqual([
			"50.0%",
			"64.8",
			"259",
			"76.8%",
			"3",
			"9-3-0",
		]);
	});

	it("drops zero values and stats a team doesn't have", () => {
		// 38851J: winless here (0.0%), no awards, and 0-0-0 in eliminations
		expect(availableHighlights(redBrick)).toEqual([
			{ label: "Avg Points", value: "32.0" },
			{ label: "Total Points", value: "96" },
			{ label: "Season Win%", value: "24.0%" },
		]);
	});
});

describe("availableHighlights with missing sections", () => {
	it("returns nothing when Stats is empty", () => {
		expect(availableHighlights(makeTeam([]))).toEqual([]);
	});

	it("reads what's there when one section is missing", () => {
		const onlySeason = makeTeam(ironMeadowlarks.Stats.filter((section) => section.Name !== "This Event"));
		expect(availableHighlights(onlySeason).map((h) => h.label)).toEqual(["Season Win%", "Awards", "Elim Record"]);
	});

	it("skips a display with no data instead of throwing", () => {
		const broken = makeTeam([
			{ Name: "This Event", Order: 0, Display: [{ SectionLabel: "Points Scored", SectionData: [] }] },
		]);
		expect(availableHighlights(broken)).toEqual([]);
	});
});

describe("shuffle", () => {
	it("keeps every item exactly once", () => {
		const items = [1, 2, 3, 4, 5, 6];
		const shuffled = shuffle(items, sequence(0.9, 0.1, 0.5, 0.3, 0.7));
		expect([...shuffled].sort()).toEqual(items);
	});

	it("doesn't change the array it was given", () => {
		const items = [1, 2, 3];
		shuffle(items, () => 0);
		expect(items).toEqual([1, 2, 3]);
	});

	it("gives the same order for the same random numbers", () => {
		const items = ["a", "b", "c", "d", "e"];
		expect(shuffle(items, sequence(0.2, 0.8, 0.4, 0.6))).toEqual(shuffle(items, sequence(0.2, 0.8, 0.4, 0.6)));
	});

	it("handles a random function that returns exactly 1", () => {
		expect([...shuffle([1, 2, 3], () => 1)].sort()).toEqual([1, 2, 3]);
	});
});

describe("pickHighlights", () => {
	it("always returns 2 by default, with no duplicates", () => {
		for (const team of [...q3.MatchInfo!.Red.Teams, ...q3.MatchInfo!.Blue.Teams]) {
			const picked = pickHighlights(team);
			expect(picked).toHaveLength(2);
			expect(new Set(picked.map((h) => h.label)).size).toBe(2);
		}
	});

	it("gives the same picks for the same fixed random function", () => {
		const first = pickHighlights(ironMeadowlarks, 2, sequence(0.1, 0.9, 0.5));
		const second = pickHighlights(ironMeadowlarks, 2, sequence(0.1, 0.9, 0.5));
		expect(first).toEqual(second);
	});

	it("can pick different highlights with different random numbers", () => {
		const low = pickHighlights(ironMeadowlarks, 2, () => 0);
		const high = pickHighlights(ironMeadowlarks, 2, () => 0.999);
		expect(low).not.toEqual(high);
	});

	it("fills the last slot when a team has only one highlight", () => {
		const oneStat = makeTeam([
			{
				Name: "This Event",
				Order: 0,
				Display: [{ SectionLabel: "Points Scored", SectionData: ["Total: 40 points", "Average per match: 0.0 points"] }],
			},
		]);
		expect(pickHighlights(oneStat, 2, () => 0)).toEqual([
			{ label: "Total Points", value: "40" },
			{ label: "—", value: "—" },
		]);
	});

	it("shows placeholders for a missing team or one with no stats", () => {
		const placeholders = [
			{ label: "Record", value: "—" },
			{ label: "Avg Pts", value: "—" },
		];
		expect(pickHighlights(null)).toEqual(placeholders);
		expect(pickHighlights(makeTeam([]))).toEqual(placeholders);
	});

	it("returns exactly the count asked for", () => {
		expect(pickHighlights(ironMeadowlarks, 4, () => 0.5)).toHaveLength(4);
		expect(pickHighlights(makeTeam([]), 3)).toHaveLength(3);
	});
});
