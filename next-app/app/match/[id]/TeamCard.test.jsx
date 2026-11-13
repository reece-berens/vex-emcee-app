import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { buildMatchInfo } from "../../demoData/build";
import { DIVISION_ID, EVENT_ID } from "../../demoData/source";
import TeamCard from "./TeamCard";
import { getTeamSummary } from "./statSections";

const matchKey = `${EVENT_ID}~${DIVISION_ID}~Qualification~1~3`;
const team = buildMatchInfo(matchKey).MatchInfo.Red.Teams[0]; // 31170C
// Made-up values that don't appear anywhere in the stat sections
const highlights = [
	{ label: "Test Stat", value: "12.3%" },
	{ label: "Other Stat", value: "4.56" },
];

const renderCard = (props = {}) =>
	render(
		<TeamCard
			team={team}
			color="red"
			highlights={highlights}
			onToggle={vi.fn()}
			matchId={matchKey}
			{...props}
		/>,
	);

describe("TeamCard", () => {
	it("shows the team's number and name", () => {
		renderCard();
		expect(screen.getByText("31170C")).toBeTruthy();
		expect(screen.getByText(team.TeamName)).toBeTruthy();
	});

	it("names the team link with the team number", () => {
		renderCard();
		expect(screen.getByRole("link", { name: /31170C/ })).toBeTruthy();
	});

	it("links to the team page and keeps the match for Back", () => {
		renderCard();
		expect(screen.getByRole("link", { name: /31170C/ }).getAttribute("href")).toBe(
			`/team/${team.ID}?from=/match/${matchKey}`,
		);
	});

	it("shows the highlights it's given", () => {
		renderCard();
		expect(screen.getByText("12.3%")).toBeTruthy();
		expect(screen.getByText("Test Stat")).toBeTruthy();
		expect(screen.getByText("Other Stat")).toBeTruthy();
	});

	it("tells its column which section was opened", () => {
		const onToggle = vi.fn();
		renderCard({ onToggle });
		fireEvent.click(screen.getByRole("button", { name: "This Event, 31170C" }));
		fireEvent.click(screen.getByRole("button", { name: "Season Stats, 31170C" }));
		expect(onToggle.mock.calls).toEqual([
			["thisEvent", true],
			["seasonStats", true],
		]);
	});

	it("shows only the sections it's told are open", () => {
		renderCard({ accordions: { seasonStats: true } });
		expect(screen.getByRole("button", { name: "Season Stats, 31170C" }).getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByRole("button", { name: "This Event, 31170C" }).getAttribute("aria-expanded")).toBe("false");
	});
});

// The backend starts every team with Stats = [] and fills it in once stats exist
describe("a team with no stats yet", () => {
	const newTeam = { ...team, Stats: [] };

	it("gets placeholder summary values", () => {
		expect(getTeamSummary(newTeam)).toEqual({ record: "—", avgPoints: "—" });
	});

	it("still shows the team, with no stat sections", () => {
		renderCard({ team: newTeam });
		expect(screen.getByText("31170C")).toBeTruthy();
		expect(screen.getByRole("link", { name: /31170C/ })).toBeTruthy();
		expect(screen.queryByRole("button", { name: /This Event/ })).toBeNull();
		expect(screen.queryByRole("button", { name: /Season Stats/ })).toBeNull();
	});
});
