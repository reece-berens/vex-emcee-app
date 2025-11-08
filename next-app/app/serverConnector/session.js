/**
 * Session Management for VEX Emcee App
 * 
 * Handles user session creation and management with the VEX Emcee API.
 * Sessions are required for all API calls and are stored as cookies.
 */

import Cookies from 'js-cookie';

/**
 * Registers a new session with the VEX Emcee API
 * 
 * @returns {Promise<Object>} Result object with success status and session data
 * @returns {boolean} result.success - Whether the session was created successfully
 * @returns {string} result.session - The session token (if successful)
 * @returns {string} result.error - Error message (if failed)
 */
const registerSession = async () => {
    try {
        // Make POST request to register a new session
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}registersession`, {
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
        return { success: false, error: error.message };
    }
};

/**
 * Retrieves the current session token from browser cookies
 * 
 * @returns {string|undefined} The session token, or undefined if not found
 */
const getSession = () => {
    return Cookies.get('VEXEmceeSession');
};

/**
 * Ensures a valid session exists, creating one if necessary
 * 
 * This function checks for an existing session cookie. If found, it returns
 * that session. If not found, it automatically registers a new session.
 * 
 * @returns {Promise<Object>} Result object with success status and session data
 * @returns {boolean} result.success - Whether a session is available
 * @returns {string} result.session - The session token (if successful)
 * @returns {string} result.error - Error message (if failed)
 */
const ensureSession = async () => {
    // Check if we already have a session
    const existingSession = getSession();
    if (existingSession) {
        return { success: true, session: existingSession };
    }
    
    // No existing session, create a new one
    return await registerSession();
};

export { registerSession, getSession, ensureSession };
