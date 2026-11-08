"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ServerConnector from "../../serverConnector";
import Accordion from "../../components/Accordion";
import SampleDataNotice from "../../components/SampleDataNotice";
import { parsePercent, parsePoints, parseRankingPoints, parseRecord, parseSkill } from "../../lib/statText";
import type { SkillsRun } from "../../lib/statText";
import styles from "./TeamDetails.module.css";

type Team = VEXEmcee.API.Objects.TeamInfo;
type StatItem = VEXEmcee.API.Objects.Display.SectionDisplay;

export default function TeamDetail() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [team, setTeam] = useState<Team | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const fromRoute = searchParams.get("from"); // returns "/match/abc" or null

	useEffect(() => {
		const fetchTeam = async () => {
			const result = await ServerConnector.GetTeamInfo({ TeamID: Number(id) });
			if (result.Success && result.TeamInfo) {
				setTeam(result.TeamInfo);
			} else {
				setError(result.ErrorMessage || "Failed to load team");
			}
			setLoading(false);
		};
		fetchTeam();
	}, [id]);

	/**
	 * Render a stat item with smart formatting based on data type
	 * Returns null for empty/missing data
	 */
	const renderStatItem = (item: StatItem) => {
		// Skip if no data
		if (!item.SectionData || item.SectionData.length === 0) return null;

		const firstValue = item.SectionData[0] || "";
		const secondValue = item.SectionData[1] || "";

		// Skip if first value is empty
		if (!firstValue.trim()) return null;

		// Check if it's a W-L-T with percentage
		const record = parseRecord(firstValue);
		const percent = parsePercent(secondValue);

		if (record && percent) {
			return (
				<div key={item.SectionLabel}>
					<div className={styles.subheader}>Record</div>
					<div className={styles.statRow}>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>W-L-T</span>
							<span className={styles.statPrimary}>{record}</span>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Win Rate</span>
							<span className={styles.statPrimary}>{percent}%</span>
						</div>
					</div>
				</div>
			);
		}

		// Check if it's WP-SP-AP format (render as 3-col grid)
		const wpspap = parseRankingPoints(firstValue);
		if (wpspap) {
			const avgWpspap = item.SectionData[1] ? parseRankingPoints(item.SectionData[1]) : null;
			return (
				<div key={item.SectionLabel}>
					<div className={styles.subheader}>Ranking Points</div>
					<div className={styles.statRowTriple}>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>WP</span>
							<span className={styles.statPrimary}>{wpspap.wp}</span>
							{avgWpspap && <span className={styles.statSecondary}>{avgWpspap.wp} avg</span>}
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>SP</span>
							<span className={styles.statPrimary}>{wpspap.sp}</span>
							{avgWpspap && <span className={styles.statSecondary}>{avgWpspap.sp} avg</span>}
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>AP</span>
							<span className={styles.statPrimary}>{wpspap.ap}</span>
							{avgWpspap && <span className={styles.statSecondary}>{avgWpspap.ap} avg</span>}
						</div>
					</div>
				</div>
			);
		}

		// Check if it's Skills Results (Driver, Programming, or both)
		const skills = item.SectionData.map((line) => parseSkill(line));
		if (skills.every((skill): skill is SkillsRun => skill !== null)) {
			return (
				<div key={item.SectionLabel}>
					<div className={styles.subheader}>Skills</div>
					<div className={styles.statRow}>
						{skills.map((skill) => (
							<div
								key={skill.type}
								className={styles.statCard}
							>
								<span className={styles.statLabel}>{skill.type}</span>
								<span className={styles.statPrimary}>{skill.highScore}</span>
								<span className={styles.statSecondary}>
									{skill.attempts} {skill.attempts === "1" ? "attempt" : "attempts"}
								</span>
							</div>
						))}
					</div>
				</div>
			);
		}

		// Check if it's Points Scored - parse out just the numbers
		if (item.SectionLabel === "Points Scored") {
			const total = parsePoints(firstValue) ?? firstValue;
			const avg = parsePoints(secondValue);

			return (
				<div key={item.SectionLabel}>
					<div className={styles.subheader}>Scoring</div>
					<div className={styles.statRow}>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Total</span>
							<span className={styles.statPrimary}>{total}</span>
						</div>
						{avg && (
							<div className={styles.statCard}>
								<span className={styles.statLabel}>Average</span>
								<span className={styles.statPrimary}>{avg}</span>
							</div>
						)}
					</div>
				</div>
			);
		}

		// Default: single card with primary + secondary values
		return (
			<div
				key={item.SectionLabel}
				className={styles.statCard}
			>
				<span className={styles.statLabel}>{item.SectionLabel}</span>
				{item.SectionData.length > 0 && <span className={styles.statPrimary}>{item.SectionData[0]}</span>}
				{item.SectionData.length > 1 && (
					<div className={styles.statDetails}>
						{item.SectionData.slice(1).map((data, idx) => (
							<span
								key={idx}
								className={styles.statSecondary}
							>
								{data}
							</span>
						))}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className={styles.page}>
			{/* Sticky top bar with back button */}
			<div className={styles.topBar}>
				<button
					className={`btn ${styles.backButton}`}
					onClick={() => {
						router.push(fromRoute || "/teams"); // fallback to /teams if no param
					}}
				>
					<svg
						className={styles.backIcon}
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						height="24"
						width="24"
					>
						<path
							clipRule="evenodd"
							fillRule="evenodd"
							d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
						/>
					</svg>
				</button>
				<SampleDataNotice placement="inline" />
			</div>

			{/* Scrollable content area */}
			<div className={styles.content}>
				{/* Prev/Next navigation - always visible */}
				<div className={styles.navRow}>
					<button
						className={`btn ${styles.navButton}`}
						onClick={() =>
							team?.PreviousTeamID &&
							router.push(`/team/${team.PreviousTeamID + (fromRoute ? "?from=" + fromRoute : "")}`)
						}
						disabled={loading || !team?.PreviousTeamID}
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
								d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
							/>
						</svg>
						Prev
					</button>
					{loading ? (
						<div className={`${styles.skeleton} ${styles.skeletonTeamNumber}`} />
					) : (
						<span className={styles.navTeamNumber}>{team?.Number}</span>
					)}
					<button
						className={`btn ${styles.navButton}`}
						onClick={() => 
                            team?.NextTeamID && 
                            router.push(`/team/${team.NextTeamID + (fromRoute ? "?from=" + fromRoute : "")}`)
                        }
						disabled={loading || !team?.NextTeamID}
					>
						Next
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
								d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
							/>
						</svg>
					</button>
				</div>

				{loading && (
					<>
						{/* Skeleton header */}
						<div className={styles.skeletonHeader}>
							<div className={`${styles.skeleton} ${styles.skeletonName}`} />
							<div className={`${styles.skeleton} ${styles.skeletonLocation}`} />
						</div>

						{/* Skeleton accordion */}
						<div className={styles.skeletonAccordion}>
							<div className={`${styles.skeleton} ${styles.skeletonAccordionHeader}`} />
							{/* Subheader + 2 col */}
							<div className={`${styles.skeleton} ${styles.skeletonSubheader}`} />
							<div className={styles.skeletonStatRow}>
								<div className={`${styles.skeleton} ${styles.skeletonStatCard}`} />
								<div className={`${styles.skeleton} ${styles.skeletonStatCard}`} />
							</div>
							{/* Full width */}
							<div className={`${styles.skeleton} ${styles.skeletonStatCardFull}`} />
							{/* Subheader + 3 col */}
							<div className={`${styles.skeleton} ${styles.skeletonSubheader}`} />
							<div className={styles.skeletonStatRowTriple}>
								<div className={`${styles.skeleton} ${styles.skeletonStatCard}`} />
								<div className={`${styles.skeleton} ${styles.skeletonStatCard}`} />
								<div className={`${styles.skeleton} ${styles.skeletonStatCard}`} />
							</div>
							{/* Subheader + 2 col */}
							<div className={`${styles.skeleton} ${styles.skeletonSubheader}`} />
							<div className={styles.skeletonStatRow}>
								<div className={`${styles.skeleton} ${styles.skeletonStatCard}`} />
								<div className={`${styles.skeleton} ${styles.skeletonStatCard}`} />
							</div>
						</div>
						<div className={styles.skeletonAccordion} />
					</>
				)}

				{error && (
					<div className="messageSpan" style={{ textAlign: "center", marginTop: "var(--space-xl)" }}>
						{error}
					</div>
				)}

				{team && (
					<>
						{/* Team Header */}
						<div className={styles.teamHeader}>
							<h2 className={styles.teamName}>{team.TeamName}</h2>
							{team.Location && <p className={styles.teamLocation}>{team.Location}</p>}
						</div>
						<div className={styles.sectionWrapper}>
							{/* Dynamic Sections as Accordions */}
							{team.Sections.map((section, sectionIdx) => (
								<Accordion
									key={section.Order}
									title={section.Name}
									defaultOpen={sectionIdx === 0}
								>
									<div className={styles.sectionContent}>
										{section.Display.map((item) => renderStatItem(item))}
									</div>
								</Accordion>
							))}
						</div>

						{/* Debug: Raw JSON */}
						{/* <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>{JSON.stringify(team, null, 2)}</pre> */}
					</>
				)}
			</div>
		</div>
	);
}
