"use client";

import styles from "./Home.module.css";
import { useState, useEffect } from "react";
import ApiDropdown from "./components/ApiDropdown";

export default function Home() {
	const [regionSearch, setRegionSearch] = useState("");
	const [eventSearch, setEventSearch] = useState("");
	const [selectedProgram, setSelectedProgram] = useState("");

	// useEffect(() => {
	// 	const handleScroll = (e) => {
	// 		console.log("Main container scroll!", e.target.scrollTop);
	// 		const scrollY = e.target.scrollTop; // Use scrollTop instead of window.scrollY
	// 		const scrollPercent = scrollY / 500;

	// 		document.documentElement.style.setProperty("--scroll-x", `${scrollPercent * 100}px`);
	// 		document.documentElement.style.setProperty("--scroll-y", `${scrollPercent * 80}px`);
	// 	};

	// 	const mainElement = document.querySelector(".layout-main");
	// 	if (mainElement) {
	// 		console.log("Found main element, adding scroll listener");
	// 		mainElement.addEventListener("scroll", handleScroll);
	// 		return () => mainElement.removeEventListener("scroll", handleScroll);
	// 	} else {
	// 		console.log("Main element not found!");
	// 	}
	// }, []);

	return (
		<main className="layout-main">
			<div className="layout-content">
				<h1 className="text-lg heading-primary text-white">Find Your VEX Tournament</h1>
				<section className={styles.heroSection}>
					<h2 className="text-base heading-tertiary text-white">
						Search events by program, region, and name
					</h2>

					<div
						id="search-filters-id"
						className={`${styles.filters} cardback`}
					>
						<ApiDropdown
							endpoint="http://localhost:5181/VEXEmcee/dynamogetselectableprograms" // Add the API endpoint
							placeholder="Program (V5, IQ, U, etc.)"
							value={selectedProgram}
							onChange={setSelectedProgram}
							aria-label="Program search"
							displayField="Name" // Shows "V5", "IQ", etc.
							valueField="ID" // Uses the ID as value
							className={styles.searchField}
						/>
						<input
							id="region-input"
							type="text"
							placeholder="Region"
							value={regionSearch}
							onChange={(e) => setRegionSearch(e.target.value)}
							aria-label="Region search"
							className={styles.searchField}
						/>
						<input
							id="event-input"
							type="text"
							placeholder="Event Name"
							value={eventSearch}
							onChange={(e) => setEventSearch(e.target.value)}
							aria-label="Event name search"
							className={styles.searchField}
						/>
					</div>
					<div className={styles.buttonWrapper}>
						<button className="btn-primary">Search</button>
					</div>
				</section>

				{/* New Recent Events section */}
				<section className={styles.recentEvents}>
					<div className={`${styles.eventsList} cardback`}>
						<h2 className="text-base text-bold">Recent Events</h2>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">VEX IQ Challenge - Regional Championship</h3>
							<p className="text-sm text-muted">Austin, TX • March 15, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">V5RC High School Tournament</h3>
							<p className="text-sm text-muted">Dallas, TX • March 12, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">VEX U Competition</h3>
							<p className="text-sm text-muted">Houston, TX • March 10, 2024</p>
						</a>
					</div>
				</section>
			</div>
		</main>
	);
}
