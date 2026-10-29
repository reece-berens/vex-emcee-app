/**
 * Which data source this build uses:
 * - "demo": built-in sample data, no network calls
 * - "live": the VEX Emcee API at NEXT_PUBLIC_BASE_URL
 *
 * Set NEXT_PUBLIC_DATA_SOURCE in .env.local, or in the host's environment settings.
 * Demo is the default, so a fresh clone runs without the API.
 *
 * Next.js replaces process.env.NEXT_PUBLIC_* with its value when it builds,
 * so the choice is fixed per build. It must be read by its full name like below:
 * destructuring process.env would leave it undefined in the browser.
 */
export type DataSource = "demo" | "live";

const readDataSource = (): DataSource => {
	const value = process.env.NEXT_PUBLIC_DATA_SOURCE;
	if (value === "live") {
		return "live";
	}
	if (value && value !== "demo") {
		console.warn(`Unknown NEXT_PUBLIC_DATA_SOURCE "${value}", using demo data.`);
	}
	return "demo";
};

export const DATA_SOURCE: DataSource = readDataSource();
