import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { buildMatchInfo } from "../../demoData/build";
import { DIVISION_ID, EVENT_ID } from "../../demoData/source";
import TeamCard from "./TeamCard";

// There's no Next app around the card in a test, so useRouter gets a stand-in
const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

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

beforeEach(() => push.mockClear());

describe("TeamCard", () => {
	it("shows the team's number and name", () => {
		renderCard();
		expect(screen.getByText("31170C")).toBeTruthy();
		expect(screen.getByText(team.TeamName)).toBeTruthy();
	});

	it("names the team link with the team number", () => {
		renderCard();
		expect(screen.getByRole("button", { name: /31170C/ })).toBeTruthy();
	});

	it("opens the team page and keeps the match for Back", () => {
		renderCard();
		fireEvent.click(screen.getByRole("button", { name: /31170C/ }));
		expect(push).toHaveBeenCalledWith(`/team/${team.ID}?from=/match/${matchKey}`);
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
		fireEvent.click(screen.getByRole("button", { name: "This Event" }));
		fireEvent.click(screen.getByRole("button", { name: "Season Stats" }));
		expect(onToggle.mock.calls).toEqual([
			["thisEvent", true],
			["seasonStats", true],
		]);
	});

	it("shows only the sections it's told are open", () => {
		renderCard({ accordions: { seasonStats: true } });
		expect(screen.getByRole("button", { name: "Season Stats" }).getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByRole("button", { name: "This Event" }).getAttribute("aria-expanded")).toBe("false");
	});
});
