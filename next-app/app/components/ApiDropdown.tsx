/**
 * ApiDropdown Component
 *
 * A fully accessible custom dropdown that can fetch options from APIs,
 * use custom fetch functions, or display static options.
 *
 * Features:
 * - Fetches data from API endpoints or custom async functions
 * - Supports static options (no fetch needed)
 * - Full keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Loading, error, and empty states
 * - Customizable field mapping for different data structures
 * - Can be disabled/enabled dynamically
 *
 * Usage examples:
 *
 * 1. With API fetch function:
 *    <ApiDropdown
 *        fetchFunction={getPrograms}
 *        dataField="programs"
 *        displayField="Name"
 *        valueField="ID"
 *        ...
 *    />
 *
 * 2. With static options:
 *    <ApiDropdown
 *        staticOptions={[{ ID: 1, Name: "Option 1" }, ...]}
 *        displayField="Name"
 *        valueField="ID"
 *        ...
 *    />
 *
 * 3. Disabled until enabled:
 *    <ApiDropdown enabled={someCondition} ... />
 *
 * @param {string} endpoint - API endpoint URL to fetch options from
 * @param {Function} fetchFunction - Custom async function to fetch options (alternative to endpoint)
 * @param {Array} staticOptions - Array of options to use instead of fetching
 * @param {boolean} enabled - Whether the dropdown should fetch/be interactive (default: true)
 * @param {string} emptyMessage - Message shown when no options available
 * @param {string} dataField - Field name containing the options array in API response
 * @param {string} placeholder - Text shown when no option is selected
 * @param {any} value - Currently selected value (controlled)
 * @param {Function} onChange - Callback when selection changes: (newValue) => void
 * @param {Function} onDataLoaded - Callback when data is fetched: (data) => void
 * @param {string} displayField - Object property to display as option text
 * @param {string} valueField - Object property to use as option value
 * @param {string} className - CSS class for styling
 * @param {string} aria-label - Name screen readers announce for the dropdown
 */

import { useState, useEffect, useRef, useId } from "react";

// Options come from different APIs and are read by field name
type Option = Record<string, any>;

type ApiDropdownProps<V extends string | number> = {
	endpoint?: string;
	fetchFunction?: () => Promise<any>; // each API answers with its own response shape
	staticOptions?: object[];
	enabled?: boolean;
	emptyMessage?: string;
	dataField?: string;
	placeholder: string;
	value: V | "";
	onChange: (value: V) => void;
	onDataLoaded?: (data: Option[]) => void;
	displayField: string;
	valueField: string;
	className?: string;
	"aria-label"?: string;
};

export default function ApiDropdown<V extends string | number>({
	endpoint,
	fetchFunction,
	staticOptions,
	enabled = true,
	emptyMessage = "No results found",
	dataField = "programs",
	placeholder,
	value,
	onChange,
	onDataLoaded,
	displayField,
	valueField,
	className,
	"aria-label": ariaLabel,
}: ApiDropdownProps<V>) {
	// Links the dropdown to its options list for screen readers
	const listId = useId();

	// ============================================
	// STATE
	// ============================================

	const [options, setOptions] = useState<Option[]>([]); // Available dropdown options
	const [loading, setLoading] = useState(true); // True while fetching data
	const [error, setError] = useState<string | null>(null); // Error message if fetch failed
	const [isOpen, setIsOpen] = useState(false); // Whether dropdown list is visible
	const [focusedIndex, setFocusedIndex] = useState(-1); // Keyboard navigation: currently focused option

	// Ref for click-outside detection
	const dropdownRef = useRef<HTMLDivElement>(null);

	// ============================================
	// EFFECTS
	// ============================================

	/**
	 * Close dropdown when clicking outside
	 * Only attaches listener when dropdown is open
	 */
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setFocusedIndex(-1);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	/**
	 * Fetch options on mount (or when dependencies change)
	 *
	 * Three modes:
	 * 1. staticOptions provided → use directly, no fetch
	 * 2. enabled=false → stay in disabled state, no fetch
	 * 3. Otherwise → fetch from endpoint or fetchFunction
	 */
	useEffect(() => {
		// Mode 1: Static options - use directly
		if (staticOptions) {
			setOptions(staticOptions as Option[]);
			setLoading(false);
			return;
		}

		// Mode 2: Not enabled - stay disabled
		if (!enabled) {
			setLoading(false);
			return;
		}

		// Mode 3: Fetch data
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

					// Normalize response format
					if (Array.isArray(data)) {
						result = { success: true, [dataField]: data };
					} else if (data.success !== undefined) {
						result = data;
					} else {
						result = { success: true, [dataField]: data };
					}
				}

				// Extract options from result
				if (result.success || result.Success) {
					const dataArray = dataField ? result[dataField] || result.data : result;
					setOptions(dataArray || []);
					onDataLoaded?.(dataArray || []); // Notify parent component
					setError(null);
				} else {
					setError(result.error);
					setOptions([]);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
				setOptions([]);
			} finally {
				setLoading(false);
			}
		};

		fetchOptions();
		// Fetches once per mount. The event dropdown is remounted (key) when the filters are applied,
		// and its fetchFunction is a new function every render, so listing it here would fetch in a loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [staticOptions]);

	// ============================================
	// RENDER: LOADING STATE
	// ============================================

	if (loading) {
		return (
			<div className={`${className} custom-dropdown disabled`}>
				<div className="dropdown-text">Loading...</div>
			</div>
		);
	}

	// ============================================
	// DERIVED STATE
	// ============================================

	const isEmpty = !loading && !error && options.length === 0;
	const showNoResults = enabled && isEmpty;

	// ============================================
	// RENDER: MAIN DROPDOWN
	// ============================================

	return (
		<div className="dropdown-wrapper">
			<div
				ref={dropdownRef}
				className={`${className} custom-dropdown ${isOpen ? "open" : ""} ${error ? "has-error" : ""} ${isEmpty ? "disabled" : ""}`}
				onClick={() => {
					// Don't open if in error or empty state
					if (error || isEmpty) return;
					if (isOpen) {
						setIsOpen(false);
						setFocusedIndex(-1);
					} else {
						setIsOpen(true);
					}
				}}
				onKeyDown={(e) => {
					// Keyboard navigation
					if (error || isEmpty) return;

					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						if (isOpen && focusedIndex >= 0) {
							// Select focused option
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
				tabIndex={error || isEmpty ? -1 : 0}
				role="combobox"
				aria-expanded={isOpen}
				aria-controls={listId}
				aria-haspopup="listbox"
				aria-label={ariaLabel}
				aria-activedescendant={isOpen && focusedIndex >= 0 ? `${listId}-${focusedIndex}` : undefined}
			>
				{/* Selected value display (or placeholder) */}
				<span className="dropdown-text">
					{options.find((opt) => opt[valueField] === value)?.[displayField] || (
						<span className="placeholder">{placeholder}</span>
					)}
				</span>

				{/* Dropdown arrow / error icon */}
				<span className="dropdown-arrow">
					{error ? (
						// Error state: warning icon
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--error-color1)"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
						</svg>
					) : (
						// Normal state: chevron down
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
							/>
						</svg>
					)}
				</span>

				{/* Dropdown options list (only rendered when open) */}
				{isOpen && (
					<ul
						id={listId}
						className="dropdown-list"
						role="listbox"
					>
						{options.map((option, index) => (
							<li
								key={option[valueField]}
								id={`${listId}-${index}`}
								role="option"
								aria-selected={value === option[valueField]}
								className={`dropdown-item ${focusedIndex === index ? "focused" : ""} ${value === option[valueField] ? "selected" : ""}`}
								onClick={(e) => {
									e.stopPropagation(); // Prevent triggering parent onClick
									onChange(option[valueField]);
									setIsOpen(false);
									setFocusedIndex(-1);
								}}
							>
								<span>{option[displayField]}</span>
								{/* Checkmark for selected option */}
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
										/>
									</svg>
								)}
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Error message (shown below dropdown) */}
			{error && <span className="dropdown-error">{error}</span>}

			{/* Empty state message */}
			{showNoResults && <span className="dropdown-message">{emptyMessage}</span>}
		</div>
	);
}
