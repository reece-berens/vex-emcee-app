/**
 * Event registration: whether an event and division have been picked on the home page.
 *
 * Kept in a cookie so every tab shares it and it survives reloads. It expires after
 * one tournament day, the same for demo and live data.
 *
 * useSyncExternalStore reads it on every render. The server has no cookies,
 * so it answers null ("don't know yet"), and React switches to the browser's answer after
 * hydrating. Pages should only treat false as "not registered".
 */

import { useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import { DATA_SOURCE } from "../serverConnector/dataSource";
import { getSession } from "../serverConnector/session";

const EVENT_COOKIE = "VEXEmceeEvent";
const SESSION_COOKIE = "VEXEmceeSession";

/** 12 hours, one tournament day (js-cookie takes days) */
const LIFETIME_DAYS = 0.5;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Remember the picked event and division in this browser, for all tabs */
export function registerEvent(eventId: number, divisionId: number) {
	const options = { expires: LIFETIME_DAYS, sameSite: "lax" as const };
	Cookies.set(EVENT_COOKIE, `${eventId}~${divisionId}`, options);

	// The backend never expires sessions, so the live session ends with the registration
	const session = getSession();
	if (DATA_SOURCE === "live" && session) {
		Cookies.set(SESSION_COOKIE, session, options);
	}
	notify();
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	// Coming back to the tab is a good time to notice the cookie has expired
	window.addEventListener("focus", listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("focus", listener);
	};
}

const getSnapshot = () => Cookies.get(EVENT_COOKIE) !== undefined;
const getServerSnapshot = () => null;

/** true or false in the browser, null until then */
export function useEventRegistration() {
	return useSyncExternalStore<boolean | null>(subscribe, getSnapshot, getServerSnapshot);
}
