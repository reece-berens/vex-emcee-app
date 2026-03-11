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
import { usePathname } from "next/navigation";
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

/** Trigger page refresh on command */
const RefreshContext = createContext({
	key: 0,
	trigger: () => {},
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

/** Get current refresh key to trigger current page data refresh (used by navbar) */
export const useRefreshKey = () => useContext(RefreshContext).key;
export const useTriggerRefresh = () => useContext(RefreshContext).trigger;

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

	// Start false for SSR, then hydrate from sessionStorage
	const [eventRegistered, setEventRegisteredState] = useState(false);

	// Hydrate from sessionStorage on mount
	useEffect(() => {
		const stored = sessionStorage.getItem("eventRegistered");
		if (stored === "true") {
			setEventRegisteredState(true);
		}
	}, []);

	// Wrapper to persist to sessionStorage
	const setEventRegistered = (value) => {
		setEventRegisteredState(value);
		sessionStorage.setItem("eventRegistered", String(value));
	};

	const scrollContainerRef = useRef(null);

	/** Pathname and isHomePage constants to track if we are on the home page or not */
	const pathname = usePathname();
	const isHomePage = pathname === "/";

	/** Way for the navbar to tell the current page to "refresh your data" */
	const [refreshKey, setRefreshKey] = useState(0);
	const triggerRefresh = () => setRefreshKey((k) => k + 1);

	// Export hook

	/**
	 * Event filter state - persists across navigation
	 * Stored here so Home page selections aren't lost when switching tabs
	 */
	const [eventFilters, setEventFilters] = useState({
		program: "", // Selected program ID
		region: "", // Selected region
		event: "", // Selected event ID
		division: "", // Selected division ID
		events: [], // Fetched events array (for division lookup)
		fetchKey: 0, // Incremented to trigger event list re-fetch
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
					data-slot="icon"
					fill="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					width="24"
					height="24"
				>
					<path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"></path>
					<path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"></path>
				</svg>
			),
		},
		{
			name: "Matches",
			href: "/matches",
			icon: (
				<svg
					data-slot="icon"
					fill="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					width="24"
					height="24"
				>
					<path
						clipRule="evenodd"
						fillRule="evenodd"
						d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
					></path>
				</svg>
			),
			disabled: !eventRegistered,
		},
		{
			name: "Teams",
			href: "/teams",
			icon: (
				<svg
					data-slot="icon"
					fill="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					width="24"
					height="24"
				>
					<path
						clipRule="evenodd"
						fillRule="evenodd"
						d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
					></path>
					<path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z"></path>
				</svg>
			),
			disabled: !eventRegistered,
		},
		{
			name: "Settings",
			href: "/settings",
			icon: (
				<svg
					data-slot="icon"
					fill="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					width="24"
					height="24"
				>
					<path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 0 1-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 0 1 6.126 3.537ZM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 0 1 0 .75l-1.732 3c-.229.397-.76.5-1.067.161A5.23 5.23 0 0 1 6.75 12a5.23 5.23 0 0 1 1.37-3.536ZM10.878 17.13c-.447-.098-.623-.608-.394-1.004l1.733-3.002a.75.75 0 0 1 .65-.375h3.465c.457 0 .81.407.672.842a5.252 5.252 0 0 1-6.126 3.539Z"></path>
					<path
						clipRule="evenodd"
						fillRule="evenodd"
						d="M21 12.75a.75.75 0 1 0 0-1.5h-.783a8.22 8.22 0 0 0-.237-1.357l.734-.267a.75.75 0 1 0-.513-1.41l-.735.268a8.24 8.24 0 0 0-.689-1.192l.6-.503a.75.75 0 1 0-.964-1.149l-.6.504a8.3 8.3 0 0 0-1.054-.885l.391-.678a.75.75 0 1 0-1.299-.75l-.39.676a8.188 8.188 0 0 0-1.295-.47l.136-.77a.75.75 0 0 0-1.477-.26l-.136.77a8.36 8.36 0 0 0-1.377 0l-.136-.77a.75.75 0 1 0-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 0 0-1.3.75l.392.678a8.29 8.29 0 0 0-1.054.885l-.6-.504a.75.75 0 1 0-.965 1.149l.6.503a8.243 8.243 0 0 0-.689 1.192L3.8 8.216a.75.75 0 1 0-.513 1.41l.735.267a8.222 8.222 0 0 0-.238 1.356h-.783a.75.75 0 0 0 0 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 0 0 .513 1.41l.735-.268c.197.417.428.816.69 1.191l-.6.504a.75.75 0 0 0 .963 1.15l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 0 0 1.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.77a.75.75 0 0 0 1.477.261l.137-.772a8.332 8.332 0 0 0 1.376 0l.136.772a.75.75 0 1 0 1.477-.26l-.136-.771a8.19 8.19 0 0 0 1.294-.47l.391.677a.75.75 0 0 0 1.3-.75l-.393-.679a8.29 8.29 0 0 0 1.054-.885l.601.504a.75.75 0 0 0 .964-1.15l-.6-.503c.261-.375.492-.774.69-1.191l.735.267a.75.75 0 1 0 .512-1.41l-.734-.267c.115-.439.195-.892.237-1.356h.784Zm-2.657-3.06a6.744 6.744 0 0 0-1.19-2.053 6.784 6.784 0 0 0-1.82-1.51A6.705 6.705 0 0 0 12 5.25a6.8 6.8 0 0 0-1.225.11 6.7 6.7 0 0 0-2.15.793 6.784 6.784 0 0 0-2.952 3.489.76.76 0 0 1-.036.098A6.74 6.74 0 0 0 5.251 12a6.74 6.74 0 0 0 3.366 5.842l.009.005a6.704 6.704 0 0 0 2.18.798l.022.003a6.792 6.792 0 0 0 2.368-.004 6.704 6.704 0 0 0 2.205-.811 6.785 6.785 0 0 0 1.762-1.484l.009-.01.009-.01a6.743 6.743 0 0 0 1.18-2.066c.253-.707.39-1.469.39-2.263a6.74 6.74 0 0 0-.408-2.309Z"
					></path>
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
		<RefreshContext.Provider value={{ key: refreshKey, trigger: triggerRefresh }}>
			<ScrollContext.Provider value={scrollY}>
				<TitleContext.Provider value={{ title: pageTitle, setTitle: setPageTitle }}>
					<NavContext.Provider
						value={{ tabs: navTabs, eventRegistered, setEventRegistered, eventFilters, setEventFilters }}
					>
						{/* Scrollable content area */}
						<div
							ref={scrollContainerRef}
							className="scroll-wrapper"
						>
							{!isHomePage && <Header scrollY={scrollY} />}
							{children}
						</div>

						{/* Footer (BottomNav) - outside scroll area so it stays fixed */}
						{footer}
					</NavContext.Provider>
				</TitleContext.Provider>
			</ScrollContext.Provider>
		</RefreshContext.Provider>
	);
}
