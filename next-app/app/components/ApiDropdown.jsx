import { useState, useEffect, useRef } from "react";
import { getPrograms } from "../serverConnector/programs";

export default function ApiDropdown({ endpoint, placeholder, value, onChange, displayField, valueField, className }) {
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);

	const dropdownRef = useRef(null);

	// Handle clicking outside to close dropdown
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

	useEffect(() => {
		// This function runs when component mounts
		const fetchOptions = async () => {
			try {
				setLoading(true);
				const result = await getPrograms();

				if (result.success) {
					setOptions(result.programs);
					setError(null);
				} else {
					setError(result.error);
					setOptions([]);
				}
			} catch (err) {
				setError(err.message);
				setOptions([]);
			} finally {
				setLoading(false); // Always clear loading
			}
		};

		fetchOptions();
	}, []); // Empty array = run once when component mounts

	if (loading) {
		return (
			<div className={`${className} custom-dropdown`}>
				<div className="dropdown-text">Loading...</div>
			</div>
		);
	}

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
					if (isOpen) {
						setIsOpen(false);
						setFocusedIndex(-1);
					} else {
						setIsOpen(true);
					}
				}}
				onKeyDown={(e) => {
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
