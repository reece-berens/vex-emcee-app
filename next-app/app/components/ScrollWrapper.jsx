/**
 * ScrollWrapper Component
 *
 * Provides scroll position tracking and page title management for the entire app.
 * Creates the main scrollable container and manages scroll-based animations like
 * header fade-in and hero text clipping effects.
 *
 * Features:
 * - Tracks scroll position and provides it via React Context
 * - Manages dynamic page titles that can be set by individual pages
 * - Renders the animated header component
 * - Creates the scrollable container for all page content
 */

"use client";
import { useRef, useState, useEffect, createContext, useContext } from "react";
import Header from "./Header";

// Context for sharing scroll position across components
const ScrollContext = createContext(0);

// Context for managing dynamic page titles
const TitleContext = createContext({
	title: "VEX Emcee",
	setTitle: () => {},
});

// Hook to get current scroll position from any component
export const useScrollY = () => useContext(ScrollContext);

// Hook to get current page title
export const usePageTitle = () => useContext(TitleContext).title;

// Hook to set page title from any component
export const useSetPageTitle = () => useContext(TitleContext).setTitle;

/**
 * Main scroll wrapper component that wraps all page content
 * @param {React.ReactNode} children - Page content to be rendered inside the scrollable container
 */
export default function ScrollWrapper({ children }) {
	// Current scroll position in pixels
	const [scrollY, setScrollY] = useState(0);

	// Current page title (can be set by individual pages)
	const [pageTitle, setPageTitle] = useState("VEX Emcee");

	// Reference to the scrollable container element
	const scrollContainerRef = useRef(null);

	// Set up scroll event listener to track scroll position
	useEffect(() => {
		const handleScroll = () => {
			if (scrollContainerRef.current) {
				// Update scroll position state when user scrolls
				setScrollY(scrollContainerRef.current.scrollTop);
			}
		};

		const element = scrollContainerRef.current;
		element?.addEventListener("scroll", handleScroll);

		// Cleanup: remove event listener when component unmounts
		return () => element?.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		// Provide scroll position to all child components
		<ScrollContext.Provider value={scrollY}>
			{/* Provide title management to all child components */}
			<TitleContext.Provider value={{ title: pageTitle, setTitle: setPageTitle }}>
				<div
					ref={scrollContainerRef}
					className="scroll-wrapper"
				>
					{/* Animated header that responds to scroll position */}
					<Header scrollY={scrollY} />
					{/* Page content */}
					{children}
				</div>
			</TitleContext.Provider>
		</ScrollContext.Provider>
	);
}
