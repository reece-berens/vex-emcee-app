/**
 * Programs API Connector for VEX Emcee App
 *
 * Handles fetching VEX robotics program data (V5, IQ, U, etc.) from the API.
 * Programs are used to filter events by competition type.
 */

import { ensureSession } from "./session";

/** Shape of a program object from the API */
interface Program {
	ID: number;
	Name: string;
}

/** Result type for getPrograms */
interface ProgramsResult {
	success: boolean;
	programs?: Program[];
	error?: string;
}

/**
 * Fetches the list of available VEX programs from the API
 *
 * Programs represent different VEX competition types like:
 * - V5: VEX Robotics Competition
 * - IQ: VEX IQ Challenge
 * - U: VEX U (University level)
 * - etc.
 *
 * @returns {Promise<ProgramsResult>} Result object with success status and programs data
 *
 * @example
 * const result = await getPrograms();
 * if (result.success) {
 *   console.log(result.programs); // [{ ID: 1, Name: "V5RC", ... }, ...]
 * }
 */
const getPrograms = async (): Promise<ProgramsResult> => {
	try {
		const sessionResult = await ensureSession();
		if (!sessionResult.success) {
			return { success: false, error: "Failed to establish session" };
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}selectableprograms`, {
			method: "GET",
			headers: {
				VEXEmceeSession: sessionResult.session!,
			},
		});

		if (response.ok) {
			const data = await response.json();
			if (data.Success && data.Programs) {
				return { success: true, programs: data.Programs };
			}
		}

		return { success: false, error: "Failed to fetch programs" };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
};

export { getPrograms };
export type { Program, ProgramsResult };
