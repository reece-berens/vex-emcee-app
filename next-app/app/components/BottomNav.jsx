/**
 * BottomNav Component
 *
 * A mobile-first bottom navigation bar with animated active indicator.
 * Tabs are configured via NavContext (from AppWrapper) and support disabled states.
 *
 * Features:
 * - Sliding "pill" indicator that follows the active tab
 * - Hover ghost effect on inactive tabs (subtle background appears)
 * - Disabled tabs are dimmed and non-interactive
 * - Responsive width calculation based on number of tabs
 *
 * Visual structure:
 * ┌──────────────────────────────────────────┐
 * │  [Home]  [Matches]  [Teams]  [Settings]  │
 * │    ▲                                     │
 * │   pill (slides to active tab)            │
 * └──────────────────────────────────────────┘
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavTabs } from "./AppWrapper";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
	const pathname = usePathname();
	const tabs = useNavTabs();

	// Determine which tab is active based on current URL path
	const activeIndex = tabs.findIndex((tab) => pathname === tab.href);

	// Don't render if no tabs configured
	if (!tabs.length) return null;

	return (
		<nav className={styles.nav}>
			{/*
			 * Sliding pill indicator
			 * - Width is calculated as percentage (100% / number of tabs)
			 * - Position is controlled via translateX based on active index
			 * - The actual visible pill is rendered via ::before pseudo-element
			 */}
			<div
				className={styles.pill}
				style={{
					width: `${100 / tabs.length}%`,
					transform: `translateX(${activeIndex * 100}%)`,
				}}
			/>

			{tabs.map((tab) => {
				const isActive = pathname === tab.href;

				// Disabled tabs render as <span> instead of <Link> to prevent navigation
				return tab.disabled ? (
					<span
						key={tab.name}
						className={`${styles.tab} ${styles.disabled}`}
					>
						<span className={styles.icon}>{tab.icon}</span>
						<span className={styles.label}>{tab.name}</span>
					</span>
				) : (
					<Link
						key={tab.name}
						href={tab.href}
						className={`${styles.tab} ${isActive ? styles.active : ""}`}
					>
						<span className={styles.icon}>{tab.icon}</span>
						<span className={styles.label}>{tab.name}</span>
					</Link>
				);
			})}
		</nav>
	);
}
