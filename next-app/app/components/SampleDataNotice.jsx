/**
 * SampleDataNotice Component
 *
 * A small pill that says the data is made up. Only shown when the app runs on the demo data source.
 * Screens under 600px show "Sample data"; wider ones add ", made-up teams".
 *
 * Two placements:
 * - "page" (default): pinned to the top-right of the scrolling area, centered in the
 *   space the scroll header uses. It sits inside the scroll box, so it stays clear of the scrollbar.
 * - "inline": a plain pill, for top bars that lay it out themselves (match and team screens).
 */

import { DATA_SOURCE } from "../serverConnector/dataSource";
import styles from "./SampleDataNotice.module.css";

export default function SampleDataNotice({ placement = "page" }) {
	if (DATA_SOURCE !== "demo") return null;

	const pill = (
		<p className={styles.notice}>
			Sample data<span className={styles.detail}>, made-up teams</span>
		</p>
	);

	return placement === "inline" ? pill : <div className={styles.anchor}>{pill}</div>;
}
