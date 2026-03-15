"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ServerConnector from "../../serverConnector";
import Accordion from "../../components/Accordion";
import styles from "./MatchDetails.module.css";

/**
 * Stat extractors - each returns { label, value } or null if not available/meaningful
 * These pull "highlightsable" stats from team data for the emcee
 */
const statExtractors = [
	// Win rate from This Event
	(team) => {
		const thisEvent = team.Stats?.find((s) => s.Name === "This Event");
		const wlt = thisEvent?.Display?.find((d) => d.SectionLabel.includes("Overall WLT"));
		const pctMatch = wlt?.SectionData?.[1]?.match(/([\d.]+)%/);
		if (!pctMatch || parseFloat(pctMatch[1]) === 0) return null;
		return { label: "Win Rate", value: `${pctMatch[1]}%` };
	},
	// Qualifications Ranking
	(team) => {
		const thisEvent = team.Stats?.find((s) => s.Name === "This Event");
		const rank = thisEvent?.Display?.find((d) => d.SectionLabel.includes("Ranking"));
		const rankMatch = rank?.SectionData?.[0]?.match(/#(\d+)/);
		if (!rankMatch) return null;
		return { label: "Qual Rank", value: `#${rankMatch[1]}` };
	},
	// Driver Skills high score
	(team) => {
		const thisEvent = team.Stats?.find((s) => s.Name === "This Event");
		const skills = thisEvent?.Display?.find((d) => d.SectionLabel === "Skills");
		const driverMatch = skills?.SectionData?.[0]?.match(/Driver:.*?(\d+)\s*high score/i);
		if (!driverMatch || parseInt(driverMatch[1]) === 0) return null;
		return { label: "Driver Skills", value: driverMatch[1] };
	},
	// Programming Skills high score
	(team) => {
		const thisEvent = team.Stats?.find((s) => s.Name === "This Event");
		const skills = thisEvent?.Display?.find((d) => d.SectionLabel === "Skills");
		const progMatch = skills?.SectionData?.[1]?.match(/Programming:.*?(\d+)\s*high score/i);
		if (!progMatch || parseInt(progMatch[1]) === 0) return null;
		return { label: "Prog Skills", value: progMatch[1] };
	},
	// Average points per match
	(team) => {
		const thisEvent = team.Stats?.find((s) => s.Name === "This Event");
		const points = thisEvent?.Display?.find((d) => d.SectionLabel === "Points Scored");
		const avgMatch = points?.SectionData?.[1]?.match(/([\d.]+)\s*points/i);
		if (!avgMatch || parseFloat(avgMatch[1]) === 0) return null;
		return { label: "Avg Points", value: avgMatch[1] };
	},
	// Total points scored
	(team) => {
		const thisEvent = team.Stats?.find((s) => s.Name === "This Event");
		const points = thisEvent?.Display?.find((d) => d.SectionLabel === "Points Scored");
		const totalMatch = points?.SectionData?.[0]?.match(/([\d.]+)\s*points/i);
		if (!totalMatch || parseFloat(totalMatch[1]) === 0) return null;
		return { label: "Total Points", value: totalMatch[1] };
	},
	// Season win rate
	(team) => {
		const season = team.Stats?.find((s) => s.Name === "Season Stats Entering This Tournament");
		const wlt = season?.Display?.find((d) => d.SectionLabel === "WLT");
		const allMatch = wlt?.SectionData?.[0]?.match(/All Matches:.*?([\d.]+)%/);
		if (!allMatch || parseFloat(allMatch[1]) === 0) return null;
		return { label: "Season Win%", value: `${allMatch[1]}%` };
	},
	// Season awards
	(team) => {
		const season = team.Stats?.find((s) => s.Name === "Season Stats Entering This Tournament");
		const awards = season?.Display?.find((d) => d.SectionLabel === "Awards");
		const totalMatch = awards?.SectionData?.[0]?.match(/(\d+)\s*Total/i);
		if (!totalMatch || parseInt(totalMatch[1]) === 0) return null;
		const count = totalMatch[1];
		return { label: "Awards", value: `${count}` };
	},
	// Elimination record from season
	(team) => {
		const season = team.Stats?.find((s) => s.Name === "Season Stats Entering This Tournament");
		const wlt = season?.Display?.find((d) => d.SectionLabel === "WLT");
		const elimMatch = wlt?.SectionData?.[2]?.match(/Elimination.*?(\d+-\d+-\d+)/);
		if (!elimMatch) return null;
		const [w] = elimMatch[1].split("-").map(Number);
		if (w === 0) return null;
		return { label: "Elim Record", value: elimMatch[1] };
	},
];

/**
 * Pick random stats for a team
 * Returns array of 2 stat objects { label, value }
 */
function getRandomStats(team, count = 2) {
	// Handle missing data
	if (!team || !team.Stats) {
		return [
			{ label: "Record", value: "—" },
			{ label: "Avg Pts", value: "—" },
		];
	}

	// Get all available stats for this team
	const available = statExtractors
		.map((extractor) => {
			try {
				return extractor(team);
			} catch {
				return null;
			}
		})
		.filter((stat) => stat !== null);

	if (available.length === 0) {
		return [
			{ label: "Record", value: "—" },
			{ label: "Avg Pts", value: "—" },
		];
	}

	// Shuffle and pick
	const shuffled = [...available].sort(() => Math.random() - 0.5);
	const picked = shuffled.slice(0, Math.min(count, shuffled.length));

	// Pad with placeholder if we only got 1
	while (picked.length < count) {
		picked.push({ label: "—", value: "—" });
	}

	return picked;
}

/**
 * Extract summary stats from team's "This Event" data
 */
function getTeamSummary(team) {
	const thisEvent = team.Stats.find((s) => s.Name === "This Event");
	if (!thisEvent) return { record: "—", avgPoints: "—" };

	let record = "—";
	let avgPoints = "—";

	for (const item of thisEvent.Display) {
		if (item.SectionLabel.includes("Overall WLT")) {
			const match = item.SectionData[0]?.match(/(\d+-\d+-\d+)/);
			if (match) record = match[1];
		}
		if (item.SectionLabel === "Points Scored") {
			const avgMatch = item.SectionData[1]?.match(/([\d.]+)\s*points/);
			if (avgMatch) avgPoints = avgMatch[1];
		}
	}

	return { record, avgPoints };
}

/**
 * Parse W-L-T record string like "6-3-0" or "3-2-0 - 5 Total"
 */
function parseRecord(str) {
	const match = str?.match(/^(\d+)-(\d+)-(\d+)/);
	if (!match) return null;
	return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * Parse win percentage like "66.7% Win Pct." or "66.7% Win Rate"
 */
function parseWinPct(str) {
	const match = str?.match(/([\d.]+)%/);
	return match ? `${match[1]}%` : null;
}

/**
 * Parse points string like "Total: 386 points" or "Average per match: 42.9 points"
 */
function parsePoints(str) {
	const match = str?.match(/([\d.]+)\s*points?/i);
	return match ? match[1] : null;
}

/**
 * Convert string to title case (e.g., "OVERALL WLT" -> "Overall WLT")
 */
function toTitleCase(str) {
	return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Render a single stat card
 */
function StatCard({ label, primary, secondary }) {
	return (
		<div className={styles.statCard}>
			{label && <span className={styles.statLabel}>{label}</span>}
			<span className={styles.statPrimary}>{primary}</span>
			{secondary && <span className={styles.statSecondary}>{secondary}</span>}
		</div>
	);
}

/**
 * Render stat sections with smart parsing
 * @param {string} allianceColor - "red" or "blue" for highlightsing alliance-specific stats
 */
function renderStatSections(displayItems, summaryRecord, allianceColor) {
	return displayItems.map((item, idx) => {
		const label = item.SectionLabel;
		const data = item.SectionData || [];
		const first = data[0] || "";
		const second = data[1] || "";

		if (!first.trim()) return null;

		// Check if this is an alliance-specific stat
		const isAllianceStat =
			label.toLowerCase().includes("as red alliance") || label.toLowerCase().includes("as blue alliance");

		// WLT-style stats (record + win %)
		if (label.includes("WLT") || label === "WLT") {
			// Check if this is Season Stats format: "All Matches: 42-16-0 - 72.4% Win Pct."
			const seasonMatch = first.match(/^(.+?):\s*(\d+-\d+-\d+)\s*-\s*([\d.]+%)/);
			if (seasonMatch) {
				// Separate All Matches from Qual/Elim
				const allMatches = [];
				const qualElim = [];

				data.forEach((line, i) => {
					const m = line.match(/^(.+?):\s*(\d+-\d+-\d+)\s*-\s*([\d.]+%)/);
					if (!m) return;
					const card = (
						<StatCard
							key={i}
							label={toTitleCase(m[1])}
							primary={m[2]}
							secondary={`${m[3]} win rate`}
						/>
					);
					if (m[1].toLowerCase().includes("qualification") || m[1].toLowerCase().includes("elimination")) {
						qualElim.push(card);
					} else {
						allMatches.push(card);
					}
				});

				return (
					<div key={idx}>
						<div className={styles.subheader}>{label}</div>
						<div className={styles.statContent}>
							{allMatches}
							{qualElim.length > 0 && <div className={styles.statRow}>{qualElim}</div>}
						</div>
					</div>
				);
			}

			const record = parseRecord(first);
			const winPct = parseWinPct(second);

			// Skip if identical to summary record and no extra info
			if (label.includes("Overall") && record === summaryRecord && !winPct) {
				return null;
			}

			// Extract match count if present (e.g., "3-2-0 - 5 Total")
			const matchCount = first.match(/(\d+)\s*Total/i);
			const secondaryParts = [];
			if (matchCount) secondaryParts.push(`${matchCount[1]} matches`);
			if (winPct) secondaryParts.push(`${winPct} win rate`);

			const subheaderClass = isAllianceStat
				? `${styles.subheader} ${allianceColor === "red" ? styles.subheaderRed : styles.subheaderBlue}`
				: styles.subheader;

			return (
				<div key={idx}>
					<div className={subheaderClass}>{label}</div>
					<StatCard
						primary={record || first}
						secondary={secondaryParts.join(" · ") || null}
					/>
				</div>
			);
		}

		// Points Scored - show total and average
		if (label === "Points Scored") {
			const total = parsePoints(first);
			const avg = parsePoints(second);

			return (
				<div key={idx}>
					<div className={styles.subheader}>{label}</div>
					<div className={styles.statRow}>
						<StatCard
							label="Total"
							primary={total || first}
						/>
						{avg && (
							<StatCard
								label="Average"
								primary={avg}
							/>
						)}
					</div>
				</div>
			);
		}

		// Awards
		if (label === "Awards") {
			const totalMatch = first.match(/(\d+)\s*Total/i);
			const total = totalMatch ? totalMatch[1] : first;

			// Fix plural in secondary (e.g., "1 Judged Awards" -> "1 Judged Award")
			let secondaryText = second !== first ? second : null;
			if (secondaryText) {
				secondaryText = secondaryText.replace(
					/(\d+)(\s+\w+)\s+Awards/i,
					(m, num, type) => `${num}${type} Award${num !== "1" ? "s" : ""}`,
				);
			}

			return (
				<div key={idx}>
					<div className={styles.subheader}>{label}</div>
					<StatCard
						primary={`${total} Award${total !== "1" ? "s" : ""}`}
						secondary={secondaryText}
					/>
				</div>
			);
		}

		// Default: single card with first as primary, second as secondary
		return (
			<div key={idx}>
				<div className={styles.subheader}>{label}</div>
				<StatCard
					primary={first}
					secondary={second || null}
				/>
			</div>
		);
	});
}

export default function MatchDetail() {
	const { id } = useParams();
	const router = useRouter();
	const [match, setMatch] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Store random stats per team (keyed by team ID) so they don't change on re-render
	const [teamRandomStats, setTeamRandomStats] = useState({});

	// Track accordion open states per alliance: { teamId: { thisEvent: bool, seasonStats: bool } }
	const [redAccordions, setRedAccordions] = useState({});
	const [blueAccordions, setBlueAccordions] = useState({});

	// Check if any accordion is open in an alliance
	const hasAnyOpen = (accordionState) => {
		return Object.values(accordionState).some((team) => team.thisEvent || team.seasonStats);
	};

	// Collapse all accordions in an alliance
	const collapseAll = (setAccordions) => {
		setAccordions((prev) => {
			const newState = {};
			for (const teamId of Object.keys(prev)) {
				newState[teamId] = { thisEvent: false, seasonStats: false };
			}
			return newState;
		});
	};

	// Get accordion state for a team, defaulting to closed
	const getAccordionState = (accordionState, teamId, type) => {
		return accordionState[teamId]?.[type] ?? false;
	};

	// Set accordion state for a team
	const setAccordionState = (setAccordions, teamId, type, isOpen) => {
		setAccordions((prev) => ({
			...prev,
			[teamId]: {
				...prev[teamId],
				[type]: isOpen,
			},
		}));
	};

	useEffect(() => {
		const fetchMatch = async () => {
			const result = await ServerConnector.GetMatchInfo({ MatchKey: id });
			if (result.Success) {
				setMatch(result.MatchInfo);

				// Generate random stats for each team (once, on load)
				const allTeams = [...result.MatchInfo.Red.Teams, ...result.MatchInfo.Blue.Teams];
				const statsMap = {};
				allTeams.forEach((team) => {
					statsMap[team.ID] = getRandomStats(team, 2);
				});
				setTeamRandomStats(statsMap);
			} else {
				setError(result.ErrorMessage || "Failed to load match");
			}
			setLoading(false);
		};
		fetchMatch();
	}, [id]);

	// Calculate score bar percentages
	const getScoreBarWidth = () => {
		if (!match) return { blue: 50, red: 50 };
		const total = match.Blue.Score + match.Red.Score;
		if (total === 0) return { blue: 50, red: 50 };
		return {
			blue: (match.Blue.Score / total) * 100,
			red: (match.Red.Score / total) * 100,
		};
	};

	const scoreBar = getScoreBarWidth();

	return (
		<div className={styles.page}>
			{/* Sticky top bar with back button */}
			<div className={styles.topBar}>
				<button
					className={`btn ${styles.backButton}`}
					onClick={() => router.push("/matches")}
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
			</div>

			{/* Scrollable content area */}
			<div className={styles.content}>
				{loading && (
					<>
						{/* Skeleton Match Header */}
						<div className={styles.matchHeader}>
							<div className={`${styles.skeleton} ${styles.skeletonMatchTitle}`} />
						</div>

						{/* Skeleton Score Section */}
						<div className={styles.scoreSection}>
							<div className={styles.scoreRow}>
								<div className={`${styles.skeleton} ${styles.skeletonScoreBox}`} />
								<div className={`${styles.skeleton} ${styles.skeletonVs}`} />
								<div className={`${styles.skeleton} ${styles.skeletonScoreBox}`} />
							</div>
							<div className={`${styles.skeleton} ${styles.skeletonScoreBar}`} />
						</div>

						{/* Skeleton Alliance Sections */}
						<div className={styles.alliancesContainer}>
							{/* Red Alliance Skeleton */}
							<div className={styles.allianceSection}>
								<div className={styles.skeletonAllianceHeader}>
									<div className={`${styles.skeleton} ${styles.skeletonAllianceTitle}`} />
								</div>
								{[1, 2].map((i) => (
									<div
										key={i}
										className={styles.skeletonTeamCard}
									>
										<div className={styles.teamCardHeader}>
											<div className={`${styles.skeleton} ${styles.skeletonTeamNumber}`} />
											<div className={`${styles.skeleton} ${styles.skeletonTeamName}`} />
										</div>
										<div className={styles.skeletonHighlightsSection}>
											<div className={`${styles.skeleton} ${styles.skeletonHighlightsHeader}`} />
											<div className={styles.summaryRow}>
												<div className={`${styles.skeleton} ${styles.skeletonSummaryBox}`} />
												<div className={`${styles.skeleton} ${styles.skeletonSummaryBox}`} />
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Blue Alliance Skeleton */}
							<div className={styles.allianceSection}>
								<div className={styles.skeletonAllianceHeader}>
									<div className={`${styles.skeleton} ${styles.skeletonAllianceTitle}`} />
								</div>
								{[1, 2].map((i) => (
									<div
										key={i}
										className={styles.skeletonTeamCard}
									>
										<div className={styles.teamCardHeader}>
											<div className={`${styles.skeleton} ${styles.skeletonTeamNumber}`} />
											<div className={`${styles.skeleton} ${styles.skeletonTeamName}`} />
										</div>
										<div className={styles.skeletonHighlightsSection}>
											<div className={`${styles.skeleton} ${styles.skeletonHighlightsHeader}`} />
											<div className={styles.summaryRow}>
												<div className={`${styles.skeleton} ${styles.skeletonSummaryBox}`} />
												<div className={`${styles.skeleton} ${styles.skeletonSummaryBox}`} />
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</>
				)}
				{error && (
					<div className="messageSpan" style={{ textAlign: "center", marginTop: "var(--space-xl)" }}>
						{error}
					</div>
				)}
				{match && (
					<>
						{/* Match Header */}
						<div className={styles.matchHeader}>
							<span className={styles.matchTitle}>Qualification {match.MatchNumber}</span>
							{match.Scored && match.Tie && <span className={styles.tieBadge}>TIE</span>}
						</div>

						{/* Score Display */}
						<div className={styles.scoreSection}>
							<div className={styles.scoreRow}>
								<div
									className={`${styles.scoreBox} ${styles.red} ${match.Scored && match.RedWin ? styles.winner : ""}`}
								>
									<span className={styles.allianceLabel}>RED</span>
									<span className={styles.scoreValue}>{match.Red.Score}</span>
								</div>
								<span className={styles.vs}>vs</span>
								<div
									className={`${styles.scoreBox} ${styles.blue} ${match.Scored && match.BlueWin ? styles.winner : ""}`}
								>
									<span className={styles.allianceLabel}>BLUE</span>
									<span className={styles.scoreValue}>{match.Blue.Score}</span>
								</div>
							</div>
							{/* Score Bar */}
							<div className={styles.scoreBar}>
								<div
									className={styles.scoreBarRed}
									style={{ width: `${scoreBar.red}%` }}
								/>
								<div
									className={styles.scoreBarBlue}
									style={{ width: `${scoreBar.blue}%` }}
								/>
							</div>
						</div>

						{/* Alliance Sections - side by side on tablet+ */}
						<div className={styles.alliancesContainer}>
							{/* Red Alliance */}
							<div className={styles.allianceSection}>
								<div className={`${styles.allianceHeader} ${styles.red}`}>
									<span className={styles.allianceTitle}>Red Alliance</span>
									{match.Scored && match.RedWin && <span className={styles.winnerBadge}>WINNER</span>}
									{hasAnyOpen(redAccordions) && (
										<button
											className={styles.collapseButton}
											onClick={() => collapseAll(setRedAccordions)}
											aria-label="Collapse all"
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
								{match.Red.Teams.map((team) => {
									const summary = getTeamSummary(team);
									const randomStats = teamRandomStats[team.ID] || [];
									return (
										<div
											key={team.ID}
											className={`${styles.teamCard} ${styles.redBorder}`}
										>
											<div className={styles.teamCardHeader}>
												<div className={styles.teamCardHeaderMain}>
													<span className={styles.teamNumber}>{team.TeamNumber}</span>
													<button
														className={styles.teamLink}
														onClick={() =>
															router.push(`/team/${team.ID}?from=/match/${id}`)
														}
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
													</button>
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
													{randomStats.map((stat, idx) => (
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
														title="This Event"
														className={styles.accordionTop}
														noHoverBorder={true}
														isOpen={getAccordionState(redAccordions, team.ID, "thisEvent")}
														onToggle={(open) =>
															setAccordionState(
																setRedAccordions,
																team.ID,
																"thisEvent",
																open,
															)
														}
													>
														<div className={styles.statContent}>
															{renderStatSections(stat.Display, summary.record, "red")}
														</div>
													</Accordion>
												))}

												{team.Stats.filter(
													(s) => s.Name === "Season Stats Entering This Tournament",
												).map((stat) => (
													<Accordion
														key={stat.Order}
														title="Season Stats"
														className={styles.accordionBottom}
														noHoverBorder={true}
														isOpen={getAccordionState(
															redAccordions,
															team.ID,
															"seasonStats",
														)}
														onToggle={(open) =>
															setAccordionState(
																setRedAccordions,
																team.ID,
																"seasonStats",
																open,
															)
														}
													>
														<div className={styles.statContent}>
															{renderStatSections(stat.Display, null, "red")}
														</div>
													</Accordion>
												))}
											</div>
										</div>
									);
								})}
							</div>

							{/* Blue Alliance */}
							<div className={styles.allianceSection}>
								<div className={`${styles.allianceHeader} ${styles.blue}`}>
									<span className={styles.allianceTitle}>Blue Alliance</span>
									{match.Scored && match.BlueWin && (
										<span className={styles.winnerBadge}>WINNER</span>
									)}
									{hasAnyOpen(blueAccordions) && (
										<button
											className={styles.collapseButton}
											onClick={() => collapseAll(setBlueAccordions)}
											aria-label="Collapse all"
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
								{match.Blue.Teams.map((team) => {
									const summary = getTeamSummary(team);
									const randomStats = teamRandomStats[team.ID] || [];
									return (
										<div
											key={team.ID}
											className={`${styles.teamCard} ${styles.blueBorder}`}
										>
											<div className={styles.teamCardHeader}>
												<div className={styles.teamCardHeaderMain}>
													<span className={styles.teamNumber}>{team.TeamNumber}</span>
													<button
														className={styles.teamLink}
														onClick={() =>
															router.push(`/team/${team.ID}?from=/match/${id}`)
														}
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
													</button>
												</div>
												<div className={styles.teamCardHeaderDetails}>
													<span className={styles.teamName}>{team.TeamName}</span>
													<span className={styles.teamLocation}>{team.TeamLocator}</span>
												</div>
											</div>
											{/* highlights Stats */}
											<div className={styles.highlightsSection}>
												<div className={styles.highlightsHeader}>
													<span className={styles.highlightsText}>Highlights</span>
													<svg
														fill="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														aria-hidden="true"
														width="12"
														height="12"
													>
														<path
															clipRule="evenodd"
															fillRule="evenodd"
															d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
														/>
													</svg>
												</div>
												<div className={styles.summaryRow}>
													{randomStats.map((stat, idx) => (
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
														title="This Event"
														className={styles.accordionTop}
														noHoverBorder={true}
														isOpen={getAccordionState(blueAccordions, team.ID, "thisEvent")}
														onToggle={(open) =>
															setAccordionState(
																setBlueAccordions,
																team.ID,
																"thisEvent",
																open,
															)
														}
													>
														<div className={styles.statContent}>
															{renderStatSections(stat.Display, summary.record, "blue")}
														</div>
													</Accordion>
												))}

												{team.Stats.filter(
													(s) => s.Name === "Season Stats Entering This Tournament",
												).map((stat) => (
													<Accordion
														key={stat.Order}
														title="Season Stats"
														className={styles.accordionBottom}
														noHoverBorder={true}
														isOpen={getAccordionState(
															blueAccordions,
															team.ID,
															"seasonStats",
														)}
														onToggle={(open) =>
															setAccordionState(
																setBlueAccordions,
																team.ID,
																"seasonStats",
																open,
															)
														}
													>
														<div className={styles.statContent}>
															{renderStatSections(stat.Display, null, "blue")}
														</div>
													</Accordion>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Debug: Raw JSON */}
						{/* <details style={{ marginTop: "var(--space-xl)" }}>
							<summary style={{ cursor: "pointer", color: "var(--text-muted)" }}>Raw Data</summary>
							<pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", marginTop: "var(--space-md)" }}>
								{JSON.stringify(match, null, 2)}
							</pre>
						</details> */}
					</>
				)}
			</div>
		</div>
	);
}
