"use client";

import styles from "./Home.module.css";
import { useState } from "react";
import ApiDropdown from "./components/ApiDropdown";

export default function Home() {
	const [regionSearch, setRegionSearch] = useState("");
	const [eventSearch, setEventSearch] = useState("");
	const [selectedProgram, setSelectedProgram] = useState("");

	return (
		<main className="layout-main">
			<div className="layout-content">
				<h1 className="text-lg heading-primary">Find Your VEX Tournament</h1>
				<section className={styles.heroSection}>
					<h2 className="text-base heading-tertiary text-muted">
						Search events by program, region, and name
					</h2>

					<div
						id="search-filters-id"
						className={`${styles.filters} cardback`}
					>
						{/* <input
							id="program-input"
							type="text"
							placeholder="Program (V5, IQ, U, etc.)"
							value={programSearch}
							onChange={(e) => setProgramSearch(e.target.value)}
							aria-label="Program search"
							className={styles.searchInput}
						/> */}
						<ApiDropdown
							endpoint="http://localhost:5181/VEXEmcee/dynamogetselectableprograms" // Add the API endpoint
							placeholder="Program (V5, IQ, U, etc.)"
							value={selectedProgram}
							onChange={setSelectedProgram}
							aria-label="Program search"
							displayField="Abbr" // Shows "V5", "IQ", etc.
							valueField="Id" // Uses the ID as value
							className={styles.searchInput}
						/>
						<input
							id="region-input"
							type="text"
							placeholder="Region"
							value={regionSearch}
							onChange={(e) => setRegionSearch(e.target.value)}
							aria-label="Region search"
							className={styles.searchInput}
						/>
						<input
							id="event-input"
							type="text"
							placeholder="Event Name"
							value={eventSearch}
							onChange={(e) => setEventSearch(e.target.value)}
							aria-label="Event name search"
							className={styles.searchInput}
						/>
						{/* <select id="program-select">
							<option value="">Program (V5, IQ, U, etc.)</option>
							<option value="program1">Program 1</option>
							<option value="program2">Program 2</option>
							<option value="program3">Program 3</option>
						</select>
						<select id="region-select">
							<option value="">Region</option>
							<option value="region1">Region 1</option>
							<option value="region2">Region 2</option>
							<option value="region3">Region 3</option>
						</select>
						<select id="event-select">
							<option value="">Event Name</option>
							<option value="event1">Event 1</option>
							<option value="event2">Event 2</option>
							<option value="event3">Event 3</option>
						</select> */}
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
