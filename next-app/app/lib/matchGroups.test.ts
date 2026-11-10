import { describe, expect, it } from "vitest";
import { buildMatchList } from "../demoData/build";
import { groupMatches } from "./matchGroups";

/** A list match in the server's key format */
const match = (round: string, instance: number, number: number, scored = false) => ({
	Key: `99001~1~${round}~${instance}~${number}`,
	Scored: scored,
});

/** Qualification matches 1 to count, scored where the test says */
const quals = (count: number, isScored: (number: number) => boolean) =>
	Array.from({ length: count }, (_, i) => match("Qualification", 1, i + 1, isScored(i + 1)));

/** Each group as its id and the match numbers in it */
const summary = (groups: ReturnType<typeof groupMatches>) =>
	groups?.map((group) => [group.id, group.matches.map((m) => Number(m.Key.split("~")[4]))]);

describe("groupMatches with the demo list", () => {
	// The demo has results for Q1 to Q22, and Q23 to Q36 still to play
	const list = buildMatchList().Matches ?? [];
	const groups = groupMatches(list);

	it("splits it into latest results, up next and earlier results", () => {
		const numbers = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
		expect(summary(groups)).toEqual([
			["latest", [20, 21, 22]],
			["upNext", numbers(23, 36)],
			["earlier", numbers(1, 19)],
		]);
	});

	it("keeps the server's order when the groups are put back together", () => {
		expect(groups?.flatMap((group) => group.matches)).toEqual(list);
	});

	it("titles each group", () => {
		expect(groups?.map((group) => group.title)).toEqual(["Latest results", "Up next", "Earlier results"]);
	});
});

describe("groupMatches edge cases", () => {
	it("is one schedule group when nothing is scored", () => {
		const groups = groupMatches(quals(5, () => false));
		expect(summary(groups)).toEqual([["schedule", [1, 2, 3, 4, 5]]]);
		expect(groups?.[0].title).toBe("Schedule");
	});

	it("is one results group when everything is scored", () => {
		const groups = groupMatches(quals(5, () => true));
		expect(summary(groups)).toEqual([["results", [1, 2, 3, 4, 5]]]);
		expect(groups?.[0].title).toBe("Results");
	});

	it("has no earlier group when the last scored match is in the first 3", () => {
		expect(summary(groupMatches(quals(5, (n) => n <= 2)))).toEqual([
			["latest", [1, 2]],
			["upNext", [3, 4, 5]],
		]);
	});

	it("keeps a skipped match with the 3 latest, like the server does", () => {
		// Q6 wasn't scored, but Q7 was
		expect(summary(groupMatches(quals(8, (n) => n <= 7 && n !== 6)))).toEqual([
			["latest", [5, 6, 7]],
			["upNext", [8]],
			["earlier", [1, 2, 3, 4]],
		]);
	});

	it("sorts the list itself instead of trusting the order it was given", () => {
		const shuffled = [...quals(8, (n) => n <= 4)].reverse();
		expect(summary(groupMatches(shuffled))).toEqual([
			["latest", [2, 3, 4]],
			["upNext", [5, 6, 7, 8]],
			["earlier", [1]],
		]);
	});

	it("is empty for an empty list", () => {
		expect(groupMatches([])).toEqual([]);
	});
});

describe("groupMatches round order", () => {
	it("puts qualifications first, then each elimination round, by number then series", () => {
		const scrambled = [
			match("Final", 1, 1),
			match("SemiFinal", 1, 1),
			match("QuarterFinal", 1, 2),
			match("Qualification", 1, 2),
			match("Round16", 1, 1),
			match("QuarterFinal", 2, 1),
			match("QuarterFinal", 1, 1),
			match("Qualification", 1, 1),
		];
		const order = groupMatches(scrambled)?.[0].matches.map((m) => m.Key.split("~").slice(2).join(" "));
		expect(order).toEqual([
			"Qualification 1 1",
			"Qualification 1 2",
			"Round16 1 1",
			"QuarterFinal 1 1",
			"QuarterFinal 2 1",
			"QuarterFinal 1 2",
			"SemiFinal 1 1",
			"Final 1 1",
		]);
	});
});

describe("groupMatches with keys it can't use", () => {
	it("returns null when a key doesn't parse", () => {
		expect(groupMatches([...quals(3, () => true), { Key: "not a key", Scored: false }])).toBeNull();
	});

	it("returns null for a round the list never shows", () => {
		expect(groupMatches([match("Practice", 1, 1), ...quals(3, () => false)])).toBeNull();
	});
});
