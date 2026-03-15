/**
 * Teams Page (Placeholder)
 *
 * Will display the list of teams at the registered event.
 * Currently a placeholder - to be built out with:
 * - Team list fetched from API
 * - Search/filter functionality
 * - Team cards showing team number, name, stats
 * - Click to view team details
 *
 * This page is only accessible after event registration
 * (controlled by eventRegistered state in AppWrapper).
 */

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetPageTitle, useScrollY, useEventRegistered, useRefreshKey } from "../components/AppWrapper";
import ServerConnector from "../serverConnector";
import LoadingOverlay from "../components/LoadingOverlay";
import styles from "./Teams.module.css";

export default function Teams() {
	const setPageTitle = useSetPageTitle();
	const router = useRouter();
	const eventRegistered = useEventRegistered();
	const scrollY = useScrollY();
	const refreshKey = useRefreshKey();
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Filter teams by number or name (case-insensitive)
	const filteredTeams = teams.filter((team) => {
		const query = searchQuery.toLowerCase();
		return team.Number.toLowerCase().includes(query) || team.TeamName.toLowerCase().includes(query);
	});

	useEffect(() => {
		if (!eventRegistered) {
			router.replace("/");
		}
	}, [eventRegistered, router]);

	useEffect(() => {
		setPageTitle("Teams");
	}, [setPageTitle]);

	useEffect(() => {
		const fetchTeams = async () => {
			const result = await ServerConnector.GetTeamList({});
			if (result.Success) {
				setTeams([...result.Teams].sort((a, b) => a.NumberSortOrder - b.NumberSortOrder));
			} else {
				setError(result.ErrorMessage);
			}
			setLoading(false);
		};
		fetchTeams();
	}, [refreshKey]);

	if (!eventRegistered) return null;

	return (
		<main className={`layout-main ${styles.page}`}>
			<div className="layout-content">
				{/* Hero title with scroll-based clip animation */}
				<h1
					className={`text-hero heading-primary ${styles.pageTitle}`}
					style={{
						// Clips from top as user scrolls, creating a "disappearing" effect
						clipPath: scrollY > 0 ? `inset(${Math.min(100, scrollY * 3)}% 0 0 0)` : "none",
					}}
				>
					Teams
				</h1>
				<div className={styles.searchWrapper}>
					<div className={styles.searchInputWrapper}>
						<svg
							className={styles.searchIcon}
							fill="none"
							strokeWidth="2"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
							width={20}
							height={20}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
							></path>
						</svg>
						<input
							type="text"
							placeholder="Filter by team number or name..."
							className={styles.searchInput}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
				{loading && (
					<section className={`cardback bg-transparent ${styles.section}`}>
						<div className={styles.cardGrid}>
							{[...Array(16)].map((_, i) => (
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
				{!loading && !error && filteredTeams.length === 0 && searchQuery !== "" && (
					<section className={`cardback bg-transparent ${styles.messageSection}`}>
						<div className="messageSpan">No results</div>
					</section>
				)}
				{!loading && !error && filteredTeams.length === 0 && searchQuery === "" && (
					<section className={`cardback bg-transparent ${styles.messageSection}`}>
						<div className="messageSpan">No team data to display</div>
					</section>
				)}
				{!loading && !error && filteredTeams.length > 0 && (
					<section className={`cardback bg-transparent ${styles.section}`}>
						<div className={styles.cardGrid}>
							{filteredTeams.map((team) => (
								<div
									key={team.ID}
									className={`card ${styles.card}`}
									tabIndex={0}
									role="button"
									onClick={() => router.push(`/team/${team.ID}`)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											router.push(`/team/${team.ID}`);
										}
									}}
								>
									<div className={styles.topRow}>
										<span className={styles.teamNumber}>{team.Number}</span>
									</div>
									<span className={styles.teamName}>{team.TeamName}</span>
									<div className={styles.bottomRow}>
										<span className={styles.rankText}>
											Rank{" "}
											<span className={styles.rankNumber}>
												{team.QualiRank ? "#" + team.QualiRank : "N/A"}
											</span>
										</span>
										<span className={styles.recordText}>
											Record <span className={styles.recordWLT}>{team.EventWLT}</span>
										</span>
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
