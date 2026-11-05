/**
 * AllianceColumn Component
 *
 * One alliance on the match screen: the header (name, winner badge, collapse button)
 * and a TeamCard for each team. Red and blue each get their own, side by side on tablet+.
 *
 * Keeps track of which accordions are open in this column, so the collapse button
 * only closes this alliance's sections.
 *
 * Props:
 * @param {string} color - "red" or "blue"
 * @param {Array} teams - The alliance's teams from match info
 * @param {boolean} won - Shows the WINNER badge
 * @param {Object} highlights - Highlights for each team, keyed by team ID
 * @param {string} matchId - Passed to each TeamCard for its team link
 */

"use client";
import { useState } from "react";
import type { Highlight } from "../../lib/highlights";
import TeamCard from "./TeamCard";
import type { OpenSections, StatSection } from "./TeamCard";
import type { AllianceColor } from "./statSections";
import styles from "./MatchDetails.module.css";

type AllianceColumnProps = {
	color: AllianceColor;
	teams: VEXEmcee.API.Objects.MatchInfo.V5RCTeam[];
	won: boolean;
	highlights: Record<number, Highlight[]>;
	matchId: string;
};

export default function AllianceColumn({ color, teams, won, highlights, matchId }: AllianceColumnProps) {
	// Track accordion open states: { teamId: { thisEvent: bool, seasonStats: bool } }
	const [accordions, setAccordions] = useState<Record<number, OpenSections>>({});

	const hasAnyOpen = Object.values(accordions).some((team) => team.thisEvent || team.seasonStats);

	const setAccordion = (teamId: number, type: StatSection, isOpen: boolean) => {
		setAccordions((prev) => ({
			...prev,
			[teamId]: {
				...prev[teamId],
				[type]: isOpen,
			},
		}));
	};

	return (
		<div className={styles.allianceSection}>
			<div className={`${styles.allianceHeader} ${styles[color]}`}>
				<span className={styles.allianceTitle}>{color === "red" ? "Red" : "Blue"} Alliance</span>
				{won && <span className={styles.winnerBadge}>WINNER</span>}
				{hasAnyOpen && (
					<button
						className={styles.collapseButton}
						onClick={() => setAccordions({})}
						aria-label={`Collapse ${color} alliance stats`}
					>
						<svg
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
							height="16"
							width="16"
						>
							<path
								clipRule="evenodd"
								fillRule="evenodd"
								d="M2.25 4.5A.75.75 0 0 1 3 3.75h14.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm14.47 3.97a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 1 1-1.06 1.06L18 10.81V21a.75.75 0 0 1-1.5 0V10.81l-2.47 2.47a.75.75 0 1 1-1.06-1.06l3.75-3.75ZM2.25 9A.75.75 0 0 1 3 8.25h9.75a.75.75 0 0 1 0 1.5H3A.75.75 0 0 1 2.25 9Zm0 4.5a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Z"
							/>
						</svg>
					</button>
				)}
			</div>
			{teams.map((team) => (
				<TeamCard
					key={team.ID}
					team={team}
					color={color}
					highlights={highlights[team.ID] || []}
					accordions={accordions[team.ID]}
					onToggle={(type, isOpen) => setAccordion(team.ID, type, isOpen)}
					matchId={matchId}
				/>
			))}
		</div>
	);
}
