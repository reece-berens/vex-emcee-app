/**
 * ApiDropdown Component
 *
 * A fully accessible custom dropdown component that fetches options from APIs or custom functions.
 * Replaces native <select> elements with full styling control and better UX.
 *
 * Features:
 * - Fetches data from API endpoints or custom functions
 * - Full keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Loading and error states
 * - Customizable field mapping for different data structures
 *
 * @param {string} endpoint - API endpoint URL to fetch options from
 * @param {Function} fetchFunction - Custom function to fetch options (alternative to endpoint)
 * @param {string} dataField - Field name containing the options array in API response (default: "programs")
 * @param {string} placeholder - Text to show when no option is selected
 * @param {any} value - Currently selected value
 * @param {Function} onChange - Callback when selection changes
 * @param {string} displayField - Object property to display as option text
 * @param {string} valueField - Object property to use as option value
 * @param {string} className - CSS class for styling
 */

import { useState, useEffect, useRef } from "react";

export default function ApiDropdown({
	endpoint,
	fetchFunction,
	dataField = "programs", // default to 'programs' for backward compatibility
	placeholder,
	value,
	onChange,
	displayField,
	valueField,
	className,
}) {
	// Component state
	const [options, setOptions] = useState([]); // Available dropdown options
	const [loading, setLoading] = useState(true); // Loading state during API call
	const [error, setError] = useState(null); // Error message if API call fails
	const [isOpen, setIsOpen] = useState(false); // Whether dropdown is expanded
	const [focusedIndex, setFocusedIndex] = useState(-1); // Currently focused option for keyboard nav

	// Reference to dropdown container for click-outside detection
	const dropdownRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
				setFocusedIndex(-1);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	// Fetch options from API or custom function on component mount
	useEffect(() => {
		const fetchOptions = async () => {
			try {
				setLoading(true);
				let result;

				if (fetchFunction) {
					// Use provided custom function (e.g., getPrograms)
					result = await fetchFunction();
				} else if (endpoint) {
					// Make generic API call to endpoint
					const response = await fetch(endpoint);
					if (!response.ok) {
						throw new Error(`API call failed: ${response.status}`);
					}
					const data = await response.json();

					// Handle different API response formats:
					// 1. Direct array: [{ id: 1, name: "Item" }, ...]
					// 2. Object with success flag: { success: true, data: [...] }
					// 3. Plain object: { items: [...] }
					if (Array.isArray(data)) {
						result = { success: true, [dataField]: data };
					} else if (data.success !== undefined) {
						result = data; // Use response as-is if it has success field
					} else {
						// Assume it's a successful response, wrap it
						result = { success: true, [dataField]: data };
					}
				}

				// Extract options from result based on success status
				if (result.success) {
					const dataArray = dataField ? result[dataField] : result;
					setOptions(dataArray);
					setError(null);
				} else {
					setError(result.error);
					setOptions([]);
				}
			} catch (err) {
				setError(err.message);
				setOptions([]);
			} finally {
				setLoading(false); // Always clear loading state
			}
		};

		fetchOptions();
	}, []); // Run once when component mounts

	// Loading state UI
	if (loading) {
		return (
			<div className={`${className} custom-dropdown`}>
				<div className="dropdown-text">Loading...</div>
			</div>
		);
	}

	// Error state UI
	if (error) {
		return (
			<div className={`${className} custom-dropdown`}>
				<div className="dropdown-text">Error loading options</div>
			</div>
		);
	}

	return (
		<>
			<div
				ref={dropdownRef}
				className={`${className} custom-dropdown ${isOpen ? "open" : ""}`}
				onClick={() => {
					// Toggle dropdown open/closed
					if (isOpen) {
						setIsOpen(false);
						setFocusedIndex(-1);
					} else {
						setIsOpen(true);
					}
				}}
				onKeyDown={(e) => {
					// Keyboard navigation
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						if (isOpen && focusedIndex >= 0) {
							// Select focused item
							onChange(options[focusedIndex][valueField]);
							setIsOpen(false);
							setFocusedIndex(-1);
						} else {
							// Toggle dropdown
							setIsOpen(!isOpen);
						}
					} else if (isOpen) {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
						} else if (e.key === "Escape") {
							setIsOpen(false);
							setFocusedIndex(-1);
						}
					}
				}}
				tabIndex="0"
				role="combobox"
				aria-expanded={isOpen}
			>
				{/* Display current selection or placeholder */}
				<span className="dropdown-text">
					{value ? options.find((opt) => opt[valueField] === value)?.[displayField] : placeholder}
				</span>

				{/* Dropdown arrow icon */}
				<span className="dropdown-arrow">
					<svg
						width="20"
						height="20"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="m19.5 8.25-7.5 7.5-7.5-7.5"
						></path>
					</svg>
				</span>

				{/* Dropdown options list */}
				{isOpen && (
					<ul className="dropdown-list">
						{options.map((option, index) => (
							<li
								key={option[valueField]}
								className={`dropdown-item ${focusedIndex === index ? "focused" : ""} ${
									value === option[valueField] ? "selected" : ""
								}`}
								onClick={(e) => {
									e.stopPropagation();
									onChange(option[valueField]);
									setIsOpen(false);
									setFocusedIndex(-1);
								}}
							>
								<span>{option[displayField]}</span>
								{/* Checkmark for selected item */}
								{value === option[valueField] && (
									<svg
										width="20"
										height="20"
										fill="none"
										strokeWidth="2"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										></path>
									</svg>
								)}
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
}
