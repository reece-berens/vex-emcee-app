import { describe, expect, it } from "vitest";
import { matchKey } from "../demoData/build";
import { DEMO_MATCHES } from "../demoData/source";
import { matchLabel, matchLabelFromKey } from "./matchLabel";

// Round numbers from RE.Objects/MatchRoundType.cs
const PRACTICE = 1;
const QUALIFICATION = 2;
const QUARTERFINAL = 3;
const SEMIFINAL = 4;
const FINAL = 5;
const ROUND_16 = 6;
const ROUND_32 = 7;
const ROUND_64 = 8;
const ROUND_128 = 9;
const UNKNOWN = 99;

describe("matchLabel", () => {
	it("names practice and qualification matches by match number", () => {
		expect(matchLabel(PRACTICE, 1, 2)).toBe("Practice Match 2");
		expect(matchLabel(QUALIFICATION, 1, 3)).toBe("Qualification Match 3");
		expect(matchLabel(QUALIFICATION, 1, 36)).toBe("Qualification Match 36");
	});

	it("names the early elimination rounds with their match", () => {
		expect(matchLabel(ROUND_128, 12, 1)).toBe("Round of 128, Match 12");
		expect(matchLabel(ROUND_64, 5, 1)).toBe("Round of 64, Match 5");
		expect(matchLabel(ROUND_32, 9, 1)).toBe("Round of 32, Match 9");
		expect(matchLabel(ROUND_16, 3, 1)).toBe("Round of 16, Match 3");
	});

	it("names quarterfinals and semifinals by series", () => {
		expect(matchLabel(QUARTERFINAL, 2, 1)).toBe("Quarterfinal 2");
		expect(matchLabel(SEMIFINAL, 1, 1)).toBe("Semifinal 1");
	});

	it("leaves out the series number for the final", () => {
		expect(matchLabel(FINAL, 1, 1)).toBe("Final");
	});

	it("adds the game number from game 2", () => {
		expect(matchLabel(QUARTERFINAL, 2, 2)).toBe("Quarterfinal 2, Game 2");
		expect(matchLabel(SEMIFINAL, 1, 3)).toBe("Semifinal 1, Game 3");
		expect(matchLabel(FINAL, 1, 2)).toBe("Final, Game 2");
		expect(matchLabel(ROUND_16, 3, 2)).toBe("Round of 16, Match 3, Game 2");
	});

	it("never adds a game number to practice or qualification matches", () => {
		expect(matchLabel(QUALIFICATION, 1, 2)).toBe("Qualification Match 2");
	});

	it("falls back to the match number for rounds it doesn't know", () => {
		expect(matchLabel(UNKNOWN, 1, 4)).toBe("Match 4");
		expect(matchLabel(42, 1, 4)).toBe("Match 4");
	});
});

// Keys in the format LiveMatch.cs builds: {EventID}~{DivisionID}~{Round}~{Instance}~{MatchNumber}
describe("matchLabelFromKey", () => {
	it("reads each round name the backend writes", () => {
		expect(matchLabelFromKey("99001~1~Practice~1~2")).toBe("Practice Match 2");
		expect(matchLabelFromKey("99001~1~Qualification~1~3")).toBe("Qualification Match 3");
		expect(matchLabelFromKey("99001~1~QuarterFinal~2~1")).toBe("Quarterfinal 2");
		expect(matchLabelFromKey("99001~1~SemiFinal~1~3")).toBe("Semifinal 1, Game 3");
		expect(matchLabelFromKey("99001~1~Final~1~2")).toBe("Final, Game 2");
		expect(matchLabelFromKey("99001~1~Round16~3~1")).toBe("Round of 16, Match 3");
		expect(matchLabelFromKey("99001~1~Round32~9~1")).toBe("Round of 32, Match 9");
		expect(matchLabelFromKey("99001~1~Round64~5~1")).toBe("Round of 64, Match 5");
		expect(matchLabelFromKey("99001~1~Round128~12~3")).toBe("Round of 128, Match 12, Game 3");
		expect(matchLabelFromKey("99001~1~Unknown~1~4")).toBe("Match 4");
	});

	it("labels every demo match by its number", () => {
		for (const match of DEMO_MATCHES) {
			expect(matchLabelFromKey(matchKey(match))).toBe(`Qualification Match ${match.MatchNumber}`);
		}
	});

	it("returns null for keys in another shape", () => {
		expect(matchLabelFromKey("")).toBeNull();
		expect(matchLabelFromKey("not a key")).toBeNull();
		expect(matchLabelFromKey("99001~1~Qualification~3")).toBeNull();
		expect(matchLabelFromKey("99001~1~Qualification~1~3~extra")).toBeNull();
		expect(matchLabelFromKey("99001~1~qualification~1~3")).toBeNull();
		expect(matchLabelFromKey("99001~1~Qualification~one~3")).toBeNull();
		expect(matchLabelFromKey("99001~1~Qualification~1~")).toBeNull();
	});
});
