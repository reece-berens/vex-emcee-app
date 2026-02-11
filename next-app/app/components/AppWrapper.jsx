/**
 * AppWrapper Component
 *
 * The root wrapper for the entire app, providing global state via React Context.
 * All pages are rendered as children of this component.
 *
 * Provides three contexts:
 *
 * 1. ScrollContext - Tracks scroll position of the main content area
 *    - Used for scroll-based animations (e.g., header shrinking, parallax)
 *    - Hook: useScrollY()
 *
 * 2. TitleContext - Dynamic page title management
 *    - Pages can set their title which appears in the header
 *    - Hooks: usePageTitle(), useSetPageTitle()
 *
 * 3. NavContext - Navigation state and configuration
 *    - Contains the tab configuration for BottomNav
 *    - Tracks whether user has registered for an event (enables/disables tabs)
 *    - Hooks: useNavTabs(), useEventRegistered(), useSetEventRegistered()
 *
 * Layout structure:
 * ┌─────────────────────────────┐
 * │ <Header />                  │ ← Fixed, uses scrollY for animations
 * ├─────────────────────────────┤
 * │                             │
 * │ {children} (page content)   │ ← Scrollable area
 * │                             │
 * ├─────────────────────────────┤
 * │ {footer} (BottomNav)        │ ← Fixed at bottom, outside scroll
 * └─────────────────────────────┘
 */

"use client";
import { useRef, useState, useEffect, createContext, useContext } from "react";
import Header from "./Header";

// ============================================
// CONTEXT DEFINITIONS
// ============================================

/** Scroll position (number of pixels scrolled) */
const ScrollContext = createContext(0);

/** Page title state and setter */
const TitleContext = createContext({
	title: "VEX Emcee",
	setTitle: () => {},
});

/** Navigation tabs and event registration state */
const NavContext = createContext({
	tabs: [],
	eventRegistered: false,
	setEventRegistered: () => {},
	eventFilters: {},
	setEventFilters: () => {},
});

// ============================================
// EXPORTED HOOKS
// These provide clean access to context values
// ============================================

/** Get current scroll position (pixels from top) */
export const useScrollY = () => useContext(ScrollContext);

/** Get current page title */
export const usePageTitle = () => useContext(TitleContext).title;

/** Get function to update page title */
export const useSetPageTitle = () => useContext(TitleContext).setTitle;

/** Get array of navigation tab configurations */
export const useNavTabs = () => useContext(NavContext).tabs;

/** Get whether user has registered for an event */
export const useEventRegistered = () => useContext(NavContext).eventRegistered;

/** Get function to update event registration state */
export const useSetEventRegistered = () => useContext(NavContext).setEventRegistered;

/** Get event filter state (program, region, event, division selections) */
export const useEventFilters = () => useContext(NavContext).eventFilters;

/** Get function to update event filters */
export const useSetEventFilters = () => useContext(NavContext).setEventFilters;

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * @param {React.ReactNode} children - Page content to render
 * @param {React.ReactNode} footer - Footer component (BottomNav), rendered outside scroll area
 */
export default function AppWrapper({ children, footer }) {
	const [scrollY, setScrollY] = useState(0);
	const [pageTitle, setPageTitle] = useState("VEX Emcee");
	const [eventRegistered, setEventRegistered] = useState(false);
	const scrollContainerRef = useRef(null);

	/**
	 * Event filter state - persists across navigation
	 * Stored here so Home page selections aren't lost when switching tabs
	 */
	const [eventFilters, setEventFilters] = useState({
		program: "",      // Selected program ID
		region: "",       // Selected region
		event: "",        // Selected event ID
		division: "",     // Selected division ID
		events: [],       // Fetched events array (for division lookup)
		fetchKey: 0,      // Incremented to trigger event list re-fetch
	});

	/**
	 * Navigation tabs configuration
	 * - Home is always enabled
	 * - Other tabs are disabled until eventRegistered becomes true
	 * - Each tab has: name, href, icon (SVG), and optional disabled flag
	 */
	const navTabs = [
		{
			name: "Home",
			href: "/",
			icon: (
				<svg
					fill="none"
					strokeWidth="1.5"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
					/>
				</svg>
			),
		},
		{
			name: "Matches",
			href: "/matches",
			icon: (
				<svg
					fill="none"
					strokeWidth="1.5"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
					/>
				</svg>
			),
			disabled: !eventRegistered,
		},
		{
			name: "Teams",
			href: "/teams",
			icon: (
				<svg
					fill="none"
					strokeWidth="1.5"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
					/>
				</svg>
			),
			disabled: !eventRegistered,
		},
		{
			name: "Settings",
			href: "/settings",
			icon: (
				<svg
					fill="none"
					strokeWidth="1.5"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
					/>
				</svg>
			),
			disabled: !eventRegistered,
		},
	];

	/**
	 * Track scroll position of the main content area
	 * Updates scrollY state which is provided via ScrollContext
	 */
	useEffect(() => {
		const handleScroll = () => {
			if (scrollContainerRef.current) {
				setScrollY(scrollContainerRef.current.scrollTop);
			}
		};

		const element = scrollContainerRef.current;
		element?.addEventListener("scroll", handleScroll);
		return () => element?.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<ScrollContext.Provider value={scrollY}>
			<TitleContext.Provider value={{ title: pageTitle, setTitle: setPageTitle }}>
				<NavContext.Provider value={{ tabs: navTabs, eventRegistered, setEventRegistered, eventFilters, setEventFilters }}>
					{/* Scrollable content area */}
					<div
						ref={scrollContainerRef}
						className="scroll-wrapper"
					>
						<Header scrollY={scrollY} />
						{children}
					</div>

					{/* Footer (BottomNav) - outside scroll area so it stays fixed */}
					{footer}
				</NavContext.Provider>
			</TitleContext.Provider>
		</ScrollContext.Provider>
	);
}
