import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { buildMatchInfo } from "../../demoData/build";
import { DIVISION_ID, EVENT_ID } from "../../demoData/source";
import AllianceColumn from "./AllianceColumn";

// Q3: 31170C and 8204A (red) against 38851J and 7263M (blue)
const matchKey = `${EVENT_ID}~${DIVISION_ID}~Qualification~1~3`;
const match = buildMatchInfo(matchKey).MatchInfo;

const renderColumn = (props = {}) =>
	render(
		<AllianceColumn
			color="red"
			teams={match.Red.Teams}
			won={false}
			highlights={{}}
			matchId={matchKey}
			{...props}
		/>,
	);

describe("AllianceColumn", () => {
	it("says which alliance it is in text, not just color", () => {
		renderColumn();
		expect(screen.getByText("Red Alliance")).toBeTruthy();
	});

	it("labels the blue alliance too", () => {
		renderColumn({ color: "blue", teams: match.Blue.Teams });
		expect(screen.getByText("Blue Alliance")).toBeTruthy();
	});

	it("names every team link with its team number", () => {
		renderColumn();
		for (const team of match.Red.Teams) {
			expect(screen.getByRole("link", { name: new RegExp(team.TeamNumber) })).toBeTruthy();
		}
	});

	it("shows the WINNER badge when the alliance won", () => {
		renderColumn({ won: true });
		expect(screen.getByText("WINNER")).toBeTruthy();
	});

	it("hides the WINNER badge otherwise", () => {
		renderColumn({ won: false });
		expect(screen.queryByText("WINNER")).toBeNull();
	});

	it("gives each team its own highlights", () => {
		const [first, second] = match.Red.Teams;
		renderColumn({
			highlights: {
				[first.ID]: [{ label: "First Team Stat", value: "1.11" }],
				[second.ID]: [{ label: "Second Team Stat", value: "2.22" }],
			},
		});
		// Cards render in team order, so a mixed-up lookup would swap these
		const shown = screen.getAllByText(/Team Stat$/).map((element) => element.textContent);
		expect(shown).toEqual(["First Team Stat", "Second Team Stat"]);
	});

	it("collapses only its own sections", () => {
		render(
			<>
				<AllianceColumn
					color="red"
					teams={match.Red.Teams}
					won={false}
					highlights={{}}
					matchId={matchKey}
				/>
				<AllianceColumn
					color="blue"
					teams={match.Blue.Teams}
					won={false}
					highlights={{}}
					matchId={matchKey}
				/>
			</>,
		);

		// No collapse buttons until something is open
		expect(screen.queryByRole("button", { name: /collapse/i })).toBeNull();

		const redFirst = screen.getByRole("button", { name: "This Event, 31170C" });
		const blueFirst = screen.getByRole("button", { name: "This Event, 38851J" });
		fireEvent.click(redFirst);
		fireEvent.click(blueFirst);

		fireEvent.click(screen.getByRole("button", { name: "Collapse red alliance stats" }));

		expect(redFirst.getAttribute("aria-expanded")).toBe("false");
		expect(blueFirst.getAttribute("aria-expanded")).toBe("true");
		expect(screen.queryByRole("button", { name: "Collapse red alliance stats" })).toBeNull();
		expect(screen.getByRole("button", { name: "Collapse blue alliance stats" })).toBeTruthy();
	});
});
