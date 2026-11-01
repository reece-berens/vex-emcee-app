import { describe, expect, it } from "vitest";
import { parsePercent, parsePoints, parseRecord } from "./statText";

// Every input below is in the exact format master's C# sends (see demoData/build.ts)

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
