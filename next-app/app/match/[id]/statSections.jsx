/**
 * Stat sections for the match screen's team cards
 *
 * Turns a team's Display items (inside the "This Event" and "Season Stats" accordions)
 * into stat cards, picking a layout from each section's label.
 */

import { parsePercent, parsePoints, parseRecord } from "../../lib/statText";
import styles from "./MatchDetails.module.css";

/**
 * Extract summary stats from team's "This Event" data
 */
export function getTeamSummary(team) {
	const thisEvent = team.Stats.find((s) => s.Name === "This Event");
	if (!thisEvent) return { record: "—", avgPoints: "—" };

	let record = "—";
	let avgPoints = "—";

	for (const item of thisEvent.Display) {
		if (item.SectionLabel.includes("Overall WLT")) {
			record = parseRecord(item.SectionData[0]) ?? record;
		}
		if (item.SectionLabel === "Points Scored") {
			avgPoints = parsePoints(item.SectionData[1]) ?? avgPoints;
		}
	}

	return { record, avgPoints };
}

/**
 * Convert string to title case (e.g., "OVERALL WLT" -> "Overall WLT")
 */
function toTitleCase(str) {
	return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Render a single stat card
 */
function StatCard({ label, primary, secondary }) {
	return (
		<div className={styles.statCard}>
			{label && <span className={styles.statLabel}>{label}</span>}
			<span className={styles.statPrimary}>{primary}</span>
			{secondary && <span className={styles.statSecondary}>{secondary}</span>}
		</div>
	);
}

/**
 * Render stat sections with smart parsing
 * @param {string} allianceColor - "red" or "blue" for highlightsing alliance-specific stats
 */
export function renderStatSections(displayItems, summaryRecord, allianceColor) {
	return displayItems.map((item, idx) => {
		const label = item.SectionLabel;
		const data = item.SectionData || [];
		const first = data[0] || "";
		const second = data[1] || "";

		if (!first.trim()) return null;

		// Check if this is an alliance-specific stat
		const isAllianceStat =
			label.toLowerCase().includes("as red alliance") || label.toLowerCase().includes("as blue alliance");

		// WLT-style stats (record + win %)
		if (label.includes("WLT") || label === "WLT") {
			// Check if this is Season Stats format: "All Matches: 42-16-0 - 72.4% Win Pct."
			const seasonMatch = first.match(/^(.+?):\s*(\d+-\d+-\d+)\s*-\s*([\d.]+%)/);
			if (seasonMatch) {
				// Separate All Matches from Qual/Elim
				const allMatches = [];
				const qualElim = [];

				data.forEach((line, i) => {
					const m = line.match(/^(.+?):\s*(\d+-\d+-\d+)\s*-\s*([\d.]+%)/);
					if (!m) return;
					const card = (
						<StatCard
							key={i}
							label={toTitleCase(m[1])}
							primary={m[2]}
							secondary={`${m[3]} win rate`}
						/>
					);
					if (m[1].toLowerCase().includes("qualification") || m[1].toLowerCase().includes("elimination")) {
						qualElim.push(card);
					} else {
						allMatches.push(card);
					}
				});

				return (
					<div key={idx}>
						<div className={styles.subheader}>{label}</div>
						<div className={styles.statContent}>
							{allMatches}
							{qualElim.length > 0 && <div className={styles.statRow}>{qualElim}</div>}
						</div>
					</div>
				);
			}

			const record = parseRecord(first);
			const winPct = parsePercent(second);

			// Skip if identical to summary record and no extra info
			if (label.includes("Overall") && record === summaryRecord && !winPct) {
				return null;
			}

			// Extract match count if present (e.g., "3-2-0 - 5 Total")
			const matchCount = first.match(/(\d+)\s*Total/i);
			const secondaryParts = [];
			if (matchCount) secondaryParts.push(`${matchCount[1]} matches`);
			if (winPct) secondaryParts.push(`${winPct}% win rate`);

			const subheaderClass = isAllianceStat
				? `${styles.subheader} ${allianceColor === "red" ? styles.subheaderRed : styles.subheaderBlue}`
				: styles.subheader;

			return (
				<div key={idx}>
					<div className={subheaderClass}>{label}</div>
					<StatCard
						primary={record || first}
						secondary={secondaryParts.join(" · ") || null}
					/>
				</div>
			);
		}

		// Points Scored - show total and average
		if (label === "Points Scored") {
			const total = parsePoints(first);
			const avg = parsePoints(second);

			return (
				<div key={idx}>
					<div className={styles.subheader}>{label}</div>
					<div className={styles.statRow}>
						<StatCard
							label="Total"
							primary={total || first}
						/>
						{avg && (
							<StatCard
								label="Average"
								primary={avg}
							/>
						)}
					</div>
				</div>
			);
		}

		// Awards
		if (label === "Awards") {
			const totalMatch = first.match(/(\d+)\s*Total/i);
			const total = totalMatch ? totalMatch[1] : first;

			// Fix plural in secondary (e.g., "1 Judged Awards" -> "1 Judged Award")
			let secondaryText = second !== first ? second : null;
			if (secondaryText) {
				secondaryText = secondaryText.replace(
					/(\d+)(\s+\w+)\s+Awards/i,
					(m, num, type) => `${num}${type} Award${num !== "1" ? "s" : ""}`,
				);
			}

			return (
				<div key={idx}>
					<div className={styles.subheader}>{label}</div>
					<StatCard
						primary={`${total} Award${total !== "1" ? "s" : ""}`}
						secondary={secondaryText}
					/>
				</div>
			);
		}

		// Default: single card with first as primary, second as secondary
		return (
			<div key={idx}>
				<div className={styles.subheader}>{label}</div>
				<StatCard
					primary={first}
					secondary={second || null}
				/>
			</div>
		);
	});
}
