/**
 * Header Component
 *
 * A fixed header that appears as the user scrolls down.
 * Uses a two-layer fade effect for smooth appearance:
 *
 * 1. Preview text layer - Fades in first (scrollY 28-30px)
 *    - Just the title text, no background
 *    - Gives early indication of what page you're on
 *
 * 2. Full header layer - Fades in second (scrollY 48-64px)
 *    - Has the frosted glass background
 *    - Covers the preview text once fully visible
 *
 * This creates a smooth transition where the title appears
 * before the header background "catches up" to it.
 *
 * Props:
 * @param {number} scrollY - Current scroll position from AppWrapper
 */

import { usePageTitle } from "./AppWrapper";

export default function Header({ scrollY }) {
	// Get dynamic page title from context
	const title = usePageTitle();

	// Calculate opacity values based on scroll position
	// Preview text: starts fading in at 28px, fully visible at 30px
	const previewTextOpacity = Math.min(Math.max((scrollY - 28) / 2, 0), 1);
	// Full header: starts fading in at 48px, fully visible at 64px
	const headerOpacity = Math.min(Math.max((scrollY - 48) / 16, 0), 1);

	return (
		<>
			{/* Preview text layer - appears first, no background */}
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: "53px", // Match header height (without border)
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 100,
					opacity: previewTextOpacity,
					pointerEvents: "none", // Don't block interactions
				}}
			>
				<h3 className="text-bold text-base">{title}</h3>
			</div>

			{/* Full header layer - appears second, has background */}
			<header
				className="layout-header"
				style={{ opacity: headerOpacity }}
			>
				<h3 className="text-bold text-base">{title}</h3>
			</header>
		</>
	);
}
