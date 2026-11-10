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
 *    - Tracks whether user has registered for an event (enables/disables tabs),
 *      read from the cookie in lib/eventRegistration
 *    - Hooks: useNavTabs(), useEventRegistered()
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
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import SampleDataNotice from "./SampleDataNotice";
import { useEventRegistration } from "../lib/eventRegistration";

// ============================================
// TYPES
// ============================================

export type NavTab = {
	name: string;
	href: string;
	icon: ReactNode;
	disabled?: boolean;
};

/** Home page selections. An empty string means nothing is picked yet */
export type EventFilters = {
	program: number | "";
	region: string;
	event: number | "";
	division: number | "";
	events: VEXEmcee.API.Objects.REEvent[];
	fetchKey: number;
};

const DEFAULT_FILTERS: EventFilters = {
	program: "", // Selected program ID
	region: "", // Selected region
	event: "", // Selected event ID
	division: "", // Selected division ID
	events: [], // Fetched events array (for division lookup)
	fetchKey: 0, // Incremented to trigger event list re-fetch
};

// ============================================
// CONTEXT DEFINITIONS
// ============================================

/** Scroll position (number of pixels scrolled) */
const ScrollContext = createContext(0);

/** Page title state and setter */
const TitleContext = createContext<{ title: string; setTitle: (title: string) => void }>({
	title: "VEX Emcee",
	setTitle: () => {},
});

/** Navigation tabs and event registration state */
const NavContext = createContext<{
	tabs: NavTab[];
	/** null until the browser's cookie has been read */
	eventRegistered: boolean | null;
	eventFilters: EventFilters;
	setEventFilters: Dispatch<SetStateAction<EventFilters>>;
}>({
	tabs: [],
	eventRegistered: null,
	eventFilters: DEFAULT_FILTERS,
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

/** Get whether user has registered for an event: null until the browser has been checked */
export const useEventRegistered = () => useContext(NavContext).eventRegistered;

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
export default function AppWrapper({ children, footer }: { children: ReactNode; footer: ReactNode }) {
	const [scrollY, setScrollY] = useState(0);
	const [pageTitle, setPageTitle] = useState("VEX Emcee");
	const eventRegistered = useEventRegistration();

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	/** Pathname and isHomePage constants to track if we are on the home page or not */
	const pathname = usePathname();
	const isHomePage = pathname === "/";
	/** Match and team screens cover the page and show the sample data pill in their own top bar */
	const isDetailPage = pathname.startsWith("/match/") || pathname.startsWith("/team/");

	/** Way for the navbar to tell the current page to "refresh your data" */
	const [refreshKey, setRefreshKey] = useState(0);
	const triggerRefresh = () => setRefreshKey((k) => k + 1);

	// Export hook

	/**
	 * Event filter state - persists across navigation
	 * Stored here so Home page selections aren't lost when switching tabs
	 */
	const [eventFilters, setEventFilters] = useState<EventFilters>(DEFAULT_FILTERS);

	/**
	 * Navigation tabs configuration
	 * - Home is always enabled
	 * - Other tabs are disabled until eventRegistered becomes true
	 * - Each tab has: name, href, icon (SVG), and optional disabled flag
	 */
	const navTabs: NavTab[] = [
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
						value={{ tabs: navTabs, eventRegistered, eventFilters, setEventFilters }}
					>
						{/* Scrollable content area */}
						<div
							ref={scrollContainerRef}
							className="scroll-wrapper"
						>
							{!isDetailPage && <SampleDataNotice />}
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
