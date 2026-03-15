/**
 * Home Page - Event Selection
 *
 * The landing page where users select their VEX tournament event.
 * Flow:
 * 1. User selects a Program (VEX IQ, VRC, etc.) and optionally a Region
 * 2. User clicks "Apply filters" to fetch matching events
 * 3. User selects an Event from the dropdown
 * 4. If event has multiple divisions, user selects a Division
 * 5. User clicks "Continue" to register and proceed to matches
 *
 * State management:
 * - Filter state is stored in AppWrapper (persists across navigation)
 * - isRegistering is local (only needed while on this page)
 */

"use client";

import styles from "./Home.module.css";
import { useState, useEffect, useCallback } from "react";
import ApiDropdown from "./components/ApiDropdown";
import LoadingOverlay from "./components/LoadingOverlay";
import { useSetPageTitle, useSetEventRegistered, useEventFilters, useSetEventFilters } from "./components/AppWrapper";
import { useRouter } from "next/navigation";
import { getPrograms } from "./serverConnector/programs";
import GetEventList from "./serverConnector/eventList";
import RegisterEventDivision from "./serverConnector/registerEventDivision";

export default function Home() {
	// Global state from AppWrapper
	const setPageTitle = useSetPageTitle();
	const setEventRegistered = useSetEventRegistered();
	const router = useRouter();

	// Event filter state - stored globally so it persists across navigation
	const filters = useEventFilters();
	const setFilters = useSetEventFilters();

	// Helper to update a single filter field
	const updateFilter = useCallback((field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }));
	}, [setFilters]);

	// Loading state for registration API call (local - only needed on this page)
	const [isRegistering, setIsRegistering] = useState(false);

	// Derive the full event object for the selected event ID
	// Used to access divisions array and other event properties
	const selectedEventData = filters.events.find((e) => e.ID === filters.event);

	/**
	 * Auto-select division when event has only one
	 * Resets division when event changes to one with multiple divisions
	 */
	useEffect(() => {
		if (selectedEventData?.Divisions?.length === 1) {
			updateFilter("division", selectedEventData.Divisions[0].ID);
		} else if (!selectedEventData) {
			updateFilter("division", "");
		}
	}, [selectedEventData]);

	// Set page title on mount
	useEffect(() => {
		setPageTitle("Find Your VEX Tournament");
	}, []);

	/**
	 * Apply filters button handler
	 * Clears current event selection and triggers a new fetch
	 */
	const handleApplyFilters = () => {
		updateFilter("event", "");
		updateFilter("fetchKey", filters.fetchKey + 1);
	};

	/**
	 * Continue button handler
	 * Registers the user for the selected event/division
	 * Shows loading overlay during API call
	 */
	const handleContinue = async () => {
		setIsRegistering(true);

		const result = await RegisterEventDivision({
			EventID: filters.event,
			DivisionID: filters.division,
		});

		setIsRegistering(false);

		if (result.Success || result.success) {
			setEventRegistered(true);
			router.push("/matches");
		}
	};

	return (
		<>
			{/* Full-screen loading overlay - shown during registration */}
			<LoadingOverlay isOpen={isRegistering} />

			<main className={`layout-main ${styles.homeMain}`}>
				<div className="layout-content">
					{/* Hero title with scroll-based clip animation */}
					<h1 className={`text-hero heading-primary text-white ${styles.heroText}`}>
						Find Your VEX Tournament
					</h1>

					<section className="cardback bg-transparent">
						<div
							id="search-filters-id"
							className={styles.filters}
						>
							{/* ==========================================
							    FILTERS SECTION
							    Program and Region selection
							    ========================================== */}
							<div className={styles.filtersSection}>
								<h2 className="text-base text-bold text-white">Filter and Select Your Event</h2>

								{/* Program dropdown - fetches from API */}
								<ApiDropdown
									fetchFunction={getPrograms}
									dataField="programs"
									placeholder="Select Program..."
									value={filters.program}
									onChange={(val) => updateFilter("program", val)}
									enabled={!isRegistering}
									aria-label="Program search"
									displayField="Name"
									valueField="ID"
									className={styles.searchField}
								/>

								{/* Region dropdown - static options for now */}
								<ApiDropdown
									staticOptions={[
										{ ID: "", Name: "Any Region" },
										{ ID: "Kansas", Name: "Kansas" },
									]}
									placeholder="Select Region..."
									value={filters.region}
									onChange={(val) => updateFilter("region", val)}
									displayField="Name"
									valueField="ID"
									className={styles.searchField}
								/>

								{/* Filter action buttons */}
								<div className={styles.filterActions}>
									<button
										className={`btn ${styles.clearButton}`}
										onClick={() => {
											updateFilter("region", "");
											updateFilter("program", "");
										}}
									>
										Clear filters
									</button>
									<button
										className={`btn ${styles.filterButton}`}
										onClick={handleApplyFilters}
										disabled={!filters.program}
									>
										Apply filters
									</button>
								</div>
							</div>

							{/* ==========================================
							    EVENT SELECTION SECTION
							    Event dropdown, Division dropdown, Continue
							    ========================================== */}
							<div className={styles.mainEventSection}>
								{/* Event dropdown
								    - key={fetchKey} forces remount when filters applied
								    - enabled={fetchKey > 0} prevents fetch until filters applied
								    - onDataLoaded stores full event data for division lookup
								*/}
								<ApiDropdown
									key={filters.fetchKey}
									enabled={filters.fetchKey > 0}
									fetchFunction={() =>
										GetEventList({
											ProgramID: filters.program || undefined,
											Region: filters.region || undefined,
										})
									}
									dataField="Events"
									placeholder="Select Event..."
									emptyMessage="No events found"
									value={filters.event}
									onChange={(val) => updateFilter("event", val)}
									onDataLoaded={(data) => {
										updateFilter("events", data);
									}}
									aria-label="Event selection"
									displayField="Name"
									valueField="ID"
									className={styles.eventDropdown}
								/>

								{/* Division dropdown - only shown if event has multiple divisions */}
								{selectedEventData?.Divisions?.length > 1 && (
									<ApiDropdown
										staticOptions={selectedEventData.Divisions}
										placeholder="Select Division..."
										value={filters.division}
										onChange={(val) => updateFilter("division", val)}
										displayField="Name"
										valueField="ID"
										className={styles.searchField}
									/>
								)}

								{/* Continue button - disabled until event and division selected */}
								<div className={styles.mainAction}>
									<button
										className={`btn ${styles.continueButton}`}
										onClick={handleContinue}
										disabled={!filters.event || !filters.division}
									>
										Continue
									</button>
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
		</>
	);
}
