"use client";

import styles from "./Home.module.css";
import { useState, useEffect } from "react";
import ApiDropdown from "./components/ApiDropdown";
import { useScrollY } from "./components/ScrollWrapper";
import { useSetPageTitle } from "./components/ScrollWrapper";

export default function Home() {
	const scrollY = useScrollY();
	const setPageTitle = useSetPageTitle();
	const [regionSearch, setRegionSearch] = useState("");
	const [eventSearch, setEventSearch] = useState("");
	const [selectedProgram, setSelectedProgram] = useState("");

	useEffect(() => {
		setPageTitle("Find Your VEX Tournament");
	}, []);

	return (
		<main className="layout-main">
			<div className="layout-content">
				<h1
					className="text-hero heading-primary text-white"
					style={{
						clipPath: scrollY > 0 ? `inset(${Math.min(100, scrollY * 3)}% 0 0 0)` : "none",
					}}
				>
					Find Your VEX Tournament
				</h1>
				<section className="cardback bg-transparent">
					<div
						id="search-filters-id"
						className={styles.filters}
					>
						<h2 className="text-base text-bold text-white">Search events by program, region, and name</h2>
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
						<div className={styles.buttonFooter}>
							<button
								className={`btn ${styles.clearButton}`}
								onClick={() => {
									setRegionSearch("");
									setEventSearch("");
									setSelectedProgram("");
								}}
							>
								Clear all
							</button>
							<button className={`btn ${styles.searchButton}`}>
								<svg
									width="18"
									height="18"
									fill="none"
									strokeWidth="2"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
									></path>
								</svg>
								Search
							</button>
						</div>
					</div>
				</section>

				{/* New Recent Events section */}
				<section className="cardback bg-transparent">
					<div className={styles.eventsList}>
						<h2 className="text-base text-bold text-white">Recent Events</h2>
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
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">VEX IQ Elementary Skills Challenge</h3>
							<p className="text-sm text-muted">San Antonio, TX • March 8, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">V5RC Middle School State Championship</h3>
							<p className="text-sm text-muted">Fort Worth, TX • March 5, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">VEX U Engineering Division</h3>
							<p className="text-sm text-muted">Plano, TX • March 2, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">VEX IQ Teamwork Challenge</h3>
							<p className="text-sm text-muted">Arlington, TX • February 28, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">V5RC District Tournament</h3>
							<p className="text-sm text-muted">Garland, TX • February 25, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">VEX U Research Division Finals</h3>
							<p className="text-sm text-muted">Richardson, TX • February 22, 2024</p>
						</a>
						<a
							href="#"
							className="card"
						>
							<h3 className="text-sm heading-tertiary">VEX IQ Create Award Showcase</h3>
							<p className="text-sm text-muted">McKinney, TX • February 18, 2024</p>
						</a>
					</div>
				</section>
			</div>
		</main>
	);
}
