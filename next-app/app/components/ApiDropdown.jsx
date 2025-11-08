import { useState, useEffect } from "react";
import { getPrograms } from "../serverConnector/programs";

export default function ApiDropdown({ endpoint, placeholder, value, onChange, displayField, valueField, className }) {
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
			onChange={(e) => onChange(e.target.value)}
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
