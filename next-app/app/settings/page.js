/**
 * Settings Page (Placeholder)
 *
 * Will contain app settings and configuration options.
 * Currently a placeholder - potential features:
 * - Change registered event
 * - Display preferences
 * - About/help information
 *
 * This page is only accessible after event registration
 * (controlled by eventRegistered state in AppWrapper).
 */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetPageTitle, useScrollY, useEventRegistered, useRefreshKey } from "../components/AppWrapper";
import ServerConnector from "../serverConnector";
import styles from "./Settings.module.css";

export default function Settings() {
	const setPageTitle = useSetPageTitle();
	const router = useRouter();
	const eventRegistered = useEventRegistered();
	const scrollY = useScrollY();
	const refreshKey = useRefreshKey();
	const [matches, setMatches] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		setPageTitle("Settings");
	}, []);

	return (
		<main className={`layout-main ${styles.page}`}>
			<div className="layout-content">
				<h1
					className={`text-hero heading-primary ${styles.pageTitle}`}
					style={{
						clipPath: scrollY > 0 ? `inset(${Math.min(100, scrollY * 3)}% 0 0 0)` : "none",
					}}
				>
					Settings
				</h1>
				<section className="cardback bg-transparent">
					<h2 className="text-white heading-secondary">Settings will go here :)</h2>
				</section>
			</div>
		</main>
	);
}
