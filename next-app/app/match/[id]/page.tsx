"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ServerConnector from "../../serverConnector";
import SampleDataNotice from "../../components/SampleDataNotice";
import { pickHighlights } from "../../lib/highlights";
import type { Highlight } from "../../lib/highlights";
import AllianceColumn from "./AllianceColumn";
import styles from "./MatchDetails.module.css";

type Match = VEXEmcee.API.Objects.MatchInfo.V5RC;

export default function MatchDetail() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [match, setMatch] = useState<Match | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Store random stats per team (keyed by team ID) so they don't change on re-render
	const [teamRandomStats, setTeamRandomStats] = useState<Record<number, Highlight[]>>({});

	useEffect(() => {
		const fetchMatch = async () => {
			const result = await ServerConnector.GetMatchInfo({ MatchKey: id });
			if (result.Success) {
				// This screen only shows V5RC matches (red and blue alliances)
				const info = result.MatchInfo as Match;
				setMatch(info);

				// Generate random stats for each team (once, on load)
				const allTeams = [...info.Red.Teams, ...info.Blue.Teams];
				const statsMap: Record<number, Highlight[]> = {};
				allTeams.forEach((team) => {
					statsMap[team.ID] = pickHighlights(team);
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
				<SampleDataNotice placement="inline" />
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
							<AllianceColumn
								color="red"
								teams={match.Red.Teams}
								won={match.Scored && match.RedWin}
								highlights={teamRandomStats}
								matchId={id}
							/>

							{/* Blue Alliance */}
							<AllianceColumn
								color="blue"
								teams={match.Blue.Teams}
								won={match.Scored && match.BlueWin}
								highlights={teamRandomStats}
								matchId={id}
							/>
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
