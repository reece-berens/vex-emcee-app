"use client";

import styles from "./Home.module.css";
import { useState, useEffect } from "react";
import ApiDropdown from "./components/ApiDropdown";
import { useScrollY } from "./components/ScrollWrapper";
import { useSetPageTitle } from "./components/ScrollWrapper";
import { getPrograms } from "./serverConnector/programs";
import GetEventList from "./serverConnector/eventList";

export default function Home() {
	const scrollY = useScrollY();
	const setPageTitle = useSetPageTitle();
	const [regionSearch, setRegionSearch] = useState("");
	const [eventSearch, setEventSearch] = useState("");
	const [selectedProgram, setSelectedProgram] = useState("");
	const [selectedEvent, setSelectedEvent] = useState("");
	const [fetchKey, setFetchKey] = useState(0);

	useEffect(() => {
		setPageTitle("Find Your VEX Tournament");
	}, []);

	const handleApplyFilters = () => {
		setSelectedEvent(""); // Clear previous selection
		setFetchKey((prev) => prev + 1);
	};

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
						{/* Filters section */}
						<div className={styles.filtersSection}>
							<h2 className="text-base text-bold text-white">Filter and Select Your Event</h2>
							<ApiDropdown
								fetchFunction={getPrograms}
								dataField="programs"
								placeholder="Select Program..."
								value={selectedProgram}
								onChange={setSelectedProgram}
								aria-label="Program search"
								displayField="Name"
								valueField="ID"
								className={styles.searchField}
							/>
							{/* <input
								id="region-input"
								type="text"
								placeholder="Region"
								value={regionSearch}
								onChange={(e) => setRegionSearch(e.target.value)}
								aria-label="Region search"
								className={styles.searchField}
							/> */}
							{/* Region - hardcoded values */}
							<ApiDropdown
								staticOptions={[
									{ ID: "", Name: "Any Region" },
									{ ID: "Kansas", Name: "Kansas" },
								]}
								placeholder="Select Region..."
								value={regionSearch}
								onChange={setRegionSearch}
								displayField="Name"
								valueField="ID"
								className={styles.searchField}
							/>
							<div className={styles.filterActions}>
								<button
									className={`btn ${styles.clearButton}`}
									onClick={() => {
										setRegionSearch("");
										setSelectedProgram("");
									}}
								>
									Clear filters
								</button>
								<button
									className={`btn ${styles.filterButton}`}
									onClick={handleApplyFilters}
									disabled={!selectedProgram}
								>
									Apply filters
								</button>
							</div>
						</div>

						{/* Main event selection */}
						<div className={styles.mainEventSection}>
							<ApiDropdown
								key={fetchKey}
								enabled={fetchKey > 0}
								fetchFunction={() =>
									GetEventList({
										ProgramID: selectedProgram || undefined,
										Region: regionSearch || undefined,
									})
								}
								dataField="Events"
								placeholder="Select Event..."
								emptyMessage="No events found"
								value={selectedEvent}
								onChange={setSelectedEvent}
								aria-label="Event selection"
								displayField="Name"
								valueField="ID"
								className={styles.eventDropdown}
							/>

							{/* Main action */}
							<div className={styles.mainAction}>
								<button
									className={`btn ${styles.continueButton}`}
									disabled={!selectedEvent}
								>
									Continue
								</button>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
