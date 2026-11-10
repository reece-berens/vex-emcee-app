/**
 * MatchGroup Component
 *
 * One headed group on the matches page ("Latest results", "Up next", ...).
 * The heading is a button that opens and closes the group. A closed group is hidden,
 * so Tab and screen readers skip its cards.
 *
 * Props:
 * @param {string} title - The group's heading
 * @param {number} count - How many matches are in it, shown after the title
 * @param {boolean} defaultOpen - Whether it starts open
 * @param {ReactNode} children - The match cards
 */

"use client";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import styles from "./Matches.module.css";

type MatchGroupProps = {
	title: string;
	count: number;
	defaultOpen?: boolean;
	children: ReactNode;
};

export default function MatchGroup({ title, count, defaultOpen = true, children }: MatchGroupProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const listId = useId();

	return (
		<section className={styles.group}>
			<h2 className={styles.groupHeading}>
				<button
					type="button"
					className={styles.groupToggle}
					aria-expanded={isOpen}
					aria-controls={listId}
					onClick={() => setIsOpen(!isOpen)}
				>
					<svg
						className={`${styles.groupChevron} ${isOpen ? styles.open : ""}`}
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						height="24"
						width="24"
					>
						<path
							clipRule="evenodd"
							fillRule="evenodd"
							d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
						/>
					</svg>
					{title}
                    <span className={styles.groupCount} aria-hidden="true"> - </span>
					<span className={styles.groupCount}>{count}</span>
				</button>
			</h2>
			<div
				id={listId}
				className={styles.cardGrid}
				hidden={!isOpen}
			>
				{children}
			</div>
		</section>
	);
}
