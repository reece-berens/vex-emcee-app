/**
 * Accordion Component
 *
 * A collapsible section with a header that toggles content visibility.
 * Uses cardback styling for the container.
 *
 * Supports controlled mode (pass isOpen + onToggle) or uncontrolled (defaultOpen).
 *
 * Closed content is only squashed to 0 height, so it's still on the page. It gets inert
 * while closed, so Tab skips its links and buttons and screen readers don't read it.
 */

"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import styles from "./Accordion.module.css";

type AccordionProps = {
	title: ReactNode;
	children: ReactNode;
	defaultOpen?: boolean;
	className?: string;
	noHoverBorder?: boolean;
	/** Pass both isOpen and onToggle to control it from outside */
	isOpen?: boolean;
	onToggle?: (isOpen: boolean) => void;
};

export default function Accordion({
	title,
	children,
	defaultOpen = true,
	className = "",
	noHoverBorder = false,
	isOpen: controlledIsOpen,
	onToggle,
}: AccordionProps) {
	const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

	// Use controlled state if provided, otherwise internal
	const isControlled = controlledIsOpen !== undefined;
	const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

	const handleToggle = () => {
		if (isControlled && onToggle) {
			onToggle(!isOpen);
		} else {
			setInternalIsOpen(!internalIsOpen);
		}
	};

	return (
		<div className={`cardback ${styles.accordion} ${noHoverBorder ? styles.noHoverBorder : ""} ${className}`}>
			<button
				className={`${styles.header} ${isOpen ? styles.open : ""}`}
				onClick={handleToggle}
				aria-expanded={isOpen}
			>
				<svg
					className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
					fill="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					height="20"
					width="20"
				>
					<path
						clipRule="evenodd"
						fillRule="evenodd"
						d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
					/>
				</svg>
				<span className={styles.title}>{title}</span>
			</button>
			<div
				className={`${styles.content} ${isOpen ? styles.open : ""}`}
				inert={!isOpen}
			>
				{children}
			</div>
		</div>
	);
}
