/**
 * Programs API Connector for VEX Emcee App
 * 
 * Handles fetching VEX robotics program data (V5, IQ, U, etc.) from the API.
 * Programs are used to filter events by competition type.
 */

import { ensureSession } from './session';

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
        // Ensure we have a valid session before making API calls
        const sessionResult = await ensureSession();
        if (!sessionResult.success) {
            return { success: false, error: 'Failed to establish session' };
        }

        // Make GET request to fetch programs list
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}selectableprograms`, {
            method: 'GET',
            headers: {
                // Include session token in request header
                'VEXEmceeSession': sessionResult.session
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Check if API returned success and programs array
            if (data.Success && data.Programs) {
                return { success: true, programs: data.Programs };
            }
        }

        return { success: false, error: 'Failed to fetch programs' };
    } catch (error) {
        // Handle network errors, JSON parsing errors, etc.
        return { success: false, error: error.message };
    }
};

export { getPrograms };
