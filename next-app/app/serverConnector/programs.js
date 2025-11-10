/**
 * Programs API Connector for VEX Emcee App
 *
 * Handles fetching VEX robotics program data (V5, IQ, U, etc.) from the API.
 * Programs are used to filter events by competition type.
 */

import { ensureSession } from "./session";

/**
 * Fetches the list of available VEX programs from the API
 *
 * Programs represent different VEX competition types like:
 * - V5: VEX Robotics Competition
 * - IQ: VEX IQ Challenge
 * - U: VEX U (University level)
 * - etc.
 *
 * @returns {Promise<Object>} Result object with success status and programs data
 * @returns {boolean} result.success - Whether the programs were fetched successfully
 * @returns {Array} result.programs - Array of program objects (if successful)
 * @returns {string} result.error - Error message (if failed)
 *
 * @example
 * const result = await getPrograms();
 * if (result.success) {
 *   console.log(result.programs); // [{ ProgramID: 1, ProgramName: "V5", ... }, ...]
 * }
 */
const getPrograms = async () => {
	try {
		const sessionResult = await ensureSession();
		if (!sessionResult.success) {
			return { success: false, error: "Failed to establish session" };
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}selectableprograms`, {
			method: "GET",
			headers: {
				VEXEmceeSession: sessionResult.session,
			},
		});

		if (response.ok) {
			const data = await response.json();
			if (data.Success && data.Programs) {
				// Add fake data for testing
				const fakePrograms = [
					...data.Programs,
					{ ID: 2, Name: "IQ - VEX IQ Challenge" },
					{ ID: 3, Name: "U - VEX U Competition" },
					{ ID: 4, Name: "VEXU - VEX University" },
					{ ID: 5, Name: "VRC - VEX Robotics Competition" },
					{ ID: 6, Name: "VAIC - VEX AI Competition" },
				];
				return { success: true, programs: fakePrograms };
			}
		}

		return { success: false, error: "Failed to fetch programs" };
	} catch (error) {
		return { success: false, error: error.message };
	}
};

export { getPrograms };
