/**
 * Matches Page (Placeholder)
 *
 * Will display the list of matches for the registered event.
 * Currently a placeholder - to be built out with:
 * - Match list fetched from API
 * - Match cards showing teams, scores, status
 * - Click to view match details
 *
 * This page is only accessible after event registration
 * (controlled by eventRegistered state in AppWrapper).
 */

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetPageTitle, useScrollY, useEventRegistered, useRefreshKey } from "../components/AppWrapper";
import ServerConnector from "../serverConnector";
import styles from "./Matches.module.css";

export default function Matches() {
	const setPageTitle = useSetPageTitle();
	const router = useRouter();
	const eventRegistered = useEventRegistered();
	const scrollY = useScrollY();
	const refreshKey = useRefreshKey();
	const [matches, setMatches] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!eventRegistered) {
			router.replace("/");
		}
	}, [eventRegistered, router]);

	useEffect(() => {
		setPageTitle("Matches");
	}, []);

	useEffect(() => {
		const fetchMatches = async () => {
			const result = await ServerConnector.GetMatchList({});
			if (result.Success) {
				setMatches(result.Matches);
			} else {
				setError(result.ErrorMessage);
			}
			setLoading(false);
		};
		fetchMatches();
	}, [refreshKey]);

	if (!eventRegistered) return null;

	return (
		<main className={`layout-main ${styles.page}`}>
			<div className="layout-content">
				<h1
					className={`text-hero heading-primary ${styles.pageTitle}`}
					style={{
						clipPath: scrollY > 0 ? `inset(${Math.min(100, scrollY * 3)}% 0 0 0)` : "none",
					}}
				>
					Matches
				</h1>
				{loading && (
					<section className={`cardback bg-transparent ${styles.section}`}>
						<div className={styles.cardGrid}>
							{[...Array(12)].map((_, i) => (
								<div
									key={i}
									className={styles.skeletonCard}
									style={{ opacity: 1.15 - i * 0.15 }}
								/>
							))}
						</div>
					</section>
				)}
				{error && (
					<section className={`cardback bg-transparent ${styles.messageSection}`}>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
						</svg>
						<div className="messageSpan">{"Error | " + error}</div>
					</section>
				)}
				{!loading && !error && matches.length === 0 && (
					<section className={`cardback bg-transparent ${styles.messageSection}`}>
						<div className="messageSpan">No match data to display</div>
					</section>
				)}
				{!loading && !error && matches.length > 0 && (
					<section className={`cardback bg-transparent ${styles.section}`}>
						<div className={styles.cardGrid}>
							{matches.map((match) => (
								<div
									key={match.Key}
									className={`card ${styles.card}`}
									tabIndex={0}
									role="button"
									onClick={() => router.push(`/match/${match.Key}`)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											router.push(`/match/${match.Key}`);
										}
									}}
								>
									<div className={`${styles.topRow} ${match.Scheduled && styles.timeIncluded}`}>
										<span className={styles.matchName}>{match.MatchName}</span>
										{match.Scheduled && (
											<span className={styles.scheduled}>
												{new Date(match.Scheduled).toLocaleTimeString("en-US", {
													hour: "numeric",
													minute: "2-digit",
													hour12: true,
												})}
											</span>
										)}

										<div className={styles.statusWrapper}>
											{/* COMPLETED status */}
											{match.Scored && (
												<svg
													data-slot="icon"
													fill="var(--ui-green)"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
													aria-hidden="true"
													width="24"
													height="24"
												>
													<path
														clipRule="evenodd"
														fillRule="evenodd"
														d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
													></path>
												</svg>
											)}
											{/* LIVE status
											{!match.Scored && match.Started && (
												// <span className={styles.liveText}>● LIVE</span>
												<span className={styles.liveText}>LIVE</span>
											)} */}
										</div>
									</div>
									<div>
										<div className={styles.middleRow}>
											<div className={styles.alliance}>
												{match.Red.TeamNumbers.map((team) => (
													<span
														key={team}
														className={styles.teamRed}
													>
														{team}
													</span>
												))}
											</div>
											<div className={styles.alliance}>
												{match.Blue.TeamNumbers.map((team) => (
													<span
														key={team}
														className={styles.teamBlue}
													>
														{team}
													</span>
												))}
											</div>
										</div>
										<div className={styles.vsWrapper}>
											{/* {match.RedWin && (
												<>
													<svg
														data-slot="icon"
														fill="var(--accent-red)"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														aria-hidden="true"
														height="20"
														width="20"
													>
														<path
															clipRule="evenodd"
															fillRule="evenodd"
															d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
														></path>
													</svg>
													<span className={[styles.vsText, styles.redWin].join(" ")}>
														WIN
													</span>
												</>
											)}
											{match.BlueWin && (
												<>
													<span className={[styles.vsText, styles.blueWin].join(" ")}>
														WIN
													</span>
													<svg
														data-slot="icon"
														fill="var(--accent-blue)"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
														aria-hidden="true"
														height="20"
														width="20"
													>
														<path
															clipRule="evenodd"
															fillRule="evenodd"
															d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
														></path>
													</svg>
												</>
											)}
											{match.Tie && (
												<span className={[styles.vsText, styles.tie].join(" ")}>TIE</span>
											)} 
											{!match.Scored && <span className={styles.vsText}>VS</span>}*/}
											<span className={styles.vsText}>VS</span>
										</div>
										<div className={styles.bottomRow}>
											<span
												className={`${styles.score} + " " + ${match.Scored && (match.RedWin || match.Tie) ? styles.win : ""}`}
											>
												{/* {match.Started ? match.Red.Score : "-"} */}
												{match.Red.Score}
											</span>

											<span
												className={`${styles.score} + " " + ${match.Scored && (match.BlueWin || match.Tie) ? styles.win : ""}`}
											>
												{/* {match.Started ? match.Blue.Score : "-"} */}
												{match.Blue.Score}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>
				)}
			</div>
		</main>
	);
}
