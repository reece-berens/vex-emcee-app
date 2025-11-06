import { useState, useEffect } from "react";

export default function ApiDropdown({ endpoint, placeholder, value, onChange, displayField, valueField, className }) {
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// This function runs when component mounts
		const fetchOptions = async () => {
			try {
				setLoading(true);
				const response = await fetch(endpoint);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setOptions(data);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchOptions();
	}, []); // Empty array = run once when component mounts

	if (loading) {
		return (
			<select
				className={className}
				disabled
			>
				<option>Loading...</option>
			</select>
		);
	}
	if (error) {
		return (
			<select
				className={className}
				disabled
			>
				<option>Error loading options</option>
			</select>
		);
	}
	return (
		<select
			className={className}
			value={value}
			onChange={onChange}
		>
			<option value="">{placeholder}</option>
			{options.map((option) => (
				<option
					key={option[valueField]}
					value={option[valueField]}
				>
					{option[displayField]}
				</option>
			))}
		</select>
	);
}
