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
import { useSetPageTitle, useScrollY, useEventRegistered } from "../components/AppWrapper";
import ServerConnector from "../serverConnector";
import LoadingOverlay from "../components/LoadingOverlay";
import styles from "./Teams.module.css";

export default function Teams() {
	const setPageTitle = useSetPageTitle();
	const router = useRouter();
	const eventRegistered = useEventRegistered();
	const scrollY = useScrollY();
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!eventRegistered) {
			router.replace("/");
		}
	}, [eventRegistered, router]);

	if (!eventRegistered) return null;

	useEffect(() => {
		setPageTitle("Teams");
	}, []);

	useEffect(() => {
		const fetchTeams = async () => {
			const result = await ServerConnector.GetTeamList({});
			console.log("Teams list response:", result); // <-- Add this
			if (result.Success) {
				setTeams(result.Teams);
			} else {
				setError(result.ErrorMessage);
			}
			setLoading(false);
		};
		fetchTeams();
	}, []);

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
				{error && <p>{error}</p>}
				{!loading && !error && (
					<section className={`cardback bg-transparent ${styles.section}`}>
						<div className={styles.cardGrid}>
							{teams.map((team) => (
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
									<span className={styles.teamNumber}>{team.Number}</span>
									<span className={styles.teamName}>{team.TeamName}</span>
								</div>
							))}
						</div>
					</section>
				)}
			</div>
		</main>
	);
}
