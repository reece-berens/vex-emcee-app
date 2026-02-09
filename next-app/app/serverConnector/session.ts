/**
 * Session Management for VEX Emcee App
 * 
 * Handles user session creation and management with the VEX Emcee API.
 * Sessions are required for all API calls and are stored as cookies.
 */

import Cookies from 'js-cookie';

/** Result type for session operations */
interface SessionResult {
    success: boolean;
    session?: string;
    error?: string;
}

/**
 * Registers a new session with the VEX Emcee API
 * 
 * @returns {Promise<SessionResult>} Result object with success status and session data
 */
const registerSession = async (): Promise<SessionResult> => {
    try {
        // Make POST request to register a new session
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Check if API returned success and session token
            if (data.Success && data.Session) {
                // Store session token in browser cookie
                Cookies.set('VEXEmceeSession', data.Session);
                return { success: true, session: data.Session };
            }
        }
        
        return { success: false, error: 'Failed to register session' };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};

/**
 * Retrieves the current session token from browser cookies
 * 
 * @returns {string|undefined} The session token, or undefined if not found
 */
const getSession = (): string | undefined => {
    return Cookies.get('VEXEmceeSession');
};

/**
 * Ensures a valid session exists, creating one if necessary
 * 
 * This function checks for an existing session cookie. If found, it returns
 * that session. If not found, it automatically registers a new session.
 * 
 * @returns {Promise<SessionResult>} Result object with success status and session data
 */
const ensureSession = async (): Promise<SessionResult> => {
    // Check if we already have a session
    const existingSession = getSession();
    if (existingSession) {
        return { success: true, session: existingSession };
    }
    
    // No existing session, create a new one
    return await registerSession();
};

export { registerSession, getSession, ensureSession };
export type { SessionResult };
