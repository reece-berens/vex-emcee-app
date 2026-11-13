/**
 * TeamCard Component
 *
 * One team on the match screen: number and team link, name and location,
 * the two highlights, then the This Event and Season Stats accordions.
 *
 * The accordions are controlled by AllianceColumn, so its collapse button can close them all.
 *
 * Props:
 * @param {Object} team - A team from match info
 * @param {string} color - "red" or "blue"
 * @param {Array} highlights - The { label, value } stats to show
 * @param {Object} accordions - Which sections are open: { thisEvent, seasonStats }
 * @param {Function} onToggle - Called with the section ("thisEvent" or "seasonStats") and whether it's open
 * @param {string} matchId - Added to the team link as ?from= so Back returns to this match
 */

"use client";
import Link from "next/link";
import Accordion from "../../components/Accordion";
import type { Highlight } from "../../lib/highlights";
import { getTeamSummary, renderStatSections } from "./statSections";
import type { AllianceColor } from "./statSections";
import styles from "./MatchDetails.module.css";

export type StatSection = "thisEvent" | "seasonStats";
export type OpenSections = Partial<Record<StatSection, boolean>>;

type TeamCardProps = {
	team: VEXEmcee.API.Objects.MatchInfo.V5RCTeam;
	color: AllianceColor;
	highlights: Highlight[];
	accordions?: OpenSections;
	onToggle: (section: StatSection, isOpen: boolean) => void;
	matchId: string;
};

export default function TeamCard({ team, color, highlights, accordions = {}, onToggle, matchId }: TeamCardProps) {
	const summary = getTeamSummary(team);

	return (
		<div className={`${styles.teamCard} ${color === "red" ? styles.redBorder : styles.blueBorder}`}>
			<div className={styles.teamCardHeader}>
				<div className={styles.teamCardHeaderMain}>
					<span className={styles.teamNumber}>{team.TeamNumber}</span>
					<Link
						className={styles.teamLink}
						href={`/team/${team.ID}?from=/match/${matchId}`}
						aria-label={`View team ${team.TeamNumber}`}
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
								d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z"
							/>
						</svg>
					</Link>
				</div>
				<div className={styles.teamCardHeaderDetails}>
					<span className={styles.teamName}>{team.TeamName}</span>
					<span className={styles.teamLocation}>{team.TeamLocator}</span>
				</div>
			</div>

			{/* Highlights Stats */}
			<div className={styles.highlightsSection}>
				<div className={styles.highlightsHeader}>
					<span className={styles.highlightsText}>Highlights</span>
					<svg
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						width="14"
						height="14"
					>
						<path
							clipRule="evenodd"
							fillRule="evenodd"
							d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
						/>
					</svg>
				</div>
				<div className={styles.summaryRow}>
					{highlights.map((stat, idx) => (
						<div
							key={idx}
							className={styles.summaryBox}
						>
							<span className={styles.summaryValue}>{stat.value}</span>
							<span className={styles.summaryLabel}>{stat.label}</span>
						</div>
					))}
				</div>
			</div>

			{/* Stacked Accordions */}
			<div className={styles.accordionStack}>
				{team.Stats.filter((s) => s.Name === "This Event").map((stat) => (
					<Accordion
						key={stat.Order}
						title={
							<>
								This Event<span className="sr-only">{`, ${team.TeamNumber}`}</span>
							</>
						}
						className={styles.accordionTop}
						noHoverBorder={true}
						isOpen={accordions.thisEvent ?? false}
						onToggle={(open) => onToggle("thisEvent", open)}
					>
						<div className={styles.statContent}>{renderStatSections(stat.Display, summary.record, color)}</div>
					</Accordion>
				))}

				{team.Stats.filter((s) => s.Name === "Season Stats Entering This Tournament").map((stat) => (
					<Accordion
						key={stat.Order}
						title={
							<>
								Season Stats<span className="sr-only">{`, ${team.TeamNumber}`}</span>
							</>
						}
						className={styles.accordionBottom}
						noHoverBorder={true}
						isOpen={accordions.seasonStats ?? false}
						onToggle={(open) => onToggle("seasonStats", open)}
					>
						<div className={styles.statContent}>{renderStatSections(stat.Display, null, color)}</div>
					</Accordion>
				))}
			</div>
		</div>
	);
}
