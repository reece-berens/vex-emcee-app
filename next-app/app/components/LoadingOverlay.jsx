/**
 * LoadingOverlay Component
 *
 * A full-screen loading overlay with a pixel-art spinning animation.
 * Used during async operations like event registration.
 *
 * Animation technique:
 * - Uses a 20x20 pixel grid where each "pixel" is a small div
 * - The spinning effect is achieved by pre-calculating which pixels
 *   should be lit for each frame of rotation (no CSS transforms)
 * - This creates an LCD/LED matrix style animation
 *
 * Performance optimization:
 * - All 72 frames are pre-calculated at module load time (generateFrames)
 * - At runtime, we just cycle through frame indices - no trig calculations
 * - The FRAMES array is generated once and reused
 *
 * The shape being animated:
 * - Four 4x4 pixel blocks arranged in a 2x2 pattern
 * - Diagonal corners are red, other corners are blue (VEX alliance colors)
 * - 2-pixel gap between blocks
 *
 * @param {boolean} isOpen - Whether the overlay is visible
 */

"use client";
import { useState, useEffect } from "react";
import styles from "./LoadingOverlay.module.css";

// ============================================
// CONFIGURATION
// ============================================

const GRID_SIZE = 20; // 20x20 pixel grid
const TOTAL_FRAMES = 72; // 72 frames = 5° per frame for smooth rotation

// Pre-calculate all animation frames at module load
const FRAMES = generateFrames();

// ============================================
// FRAME GENERATION (runs once at module load)
// ============================================

/**
 * Pre-calculates pixel states for all animation frames.
 * For each frame (rotation angle), determines which pixels
 * fall inside the rotated blocks.
 *
 * @returns {number[][]} Array of frames, each frame is array of pixel colors (0=off, 1=red, 2=blue)
 */
function generateFrames() {
	const frames = [];

	// Define the four blocks that make up the shape
	// Positioned to create a 2x2 grid with gap in center
	const blockSize = 4;
	const gap = 2;
	const offset = (GRID_SIZE - blockSize * 2 - gap) / 2;

	const blocks = [
		{ x: offset, y: offset, w: blockSize, h: blockSize, color: 1 }, // Top-left: red
		{ x: offset + blockSize + gap, y: offset, w: blockSize, h: blockSize, color: 2 }, // Top-right: blue
		{ x: offset, y: offset + blockSize + gap, w: blockSize, h: blockSize, color: 2 }, // Bottom-left: blue
		{ x: offset + blockSize + gap, y: offset + blockSize + gap, w: blockSize, h: blockSize, color: 1 }, // Bottom-right: red
	];

	// Center point for rotation
	const cx = GRID_SIZE / 2;
	const cy = GRID_SIZE / 2;

	// Generate each frame
	for (let f = 0; f < TOTAL_FRAMES; f++) {
		const angle = (f / TOTAL_FRAMES) * 360;
		const rad = (-angle * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		const pixels = [];

		// For each pixel in the grid...
		for (let y = 0; y < GRID_SIZE; y++) {
			for (let x = 0; x < GRID_SIZE; x++) {
				// Rotate pixel position backwards to check against unrotated blocks
				// (equivalent to checking if pixel is inside rotated block)
				const px = x + 0.5; // Use pixel center
				const py = y + 0.5;
				const rx = cos * (px - cx) - sin * (py - cy) + cx;
				const ry = sin * (px - cx) + cos * (py - cy) + cy;

				// Check if rotated position falls inside any block
				let color = 0; // 0 = off (transparent)
				for (const block of blocks) {
					if (rx >= block.x && rx < block.x + block.w && ry >= block.y && ry < block.y + block.h) {
						color = block.color;
						break;
					}
				}
				pixels.push(color);
			}
		}
		frames.push(pixels);
	}
	return frames;
}

// ============================================
// COMPONENT
// ============================================

export default function LoadingOverlay({ isOpen }) {
	const [frame, setFrame] = useState(0);

	// Animate through frames when overlay is open
	useEffect(() => {
		if (!isOpen) return;

		const interval = setInterval(() => {
			setFrame((f) => (f + 1) % TOTAL_FRAMES);
		}, 40); // ~25fps

		return () => clearInterval(interval);
	}, [isOpen]);

	// Don't render anything if not open
	if (!isOpen) return null;

	// Get current frame's pixel data
	const pixels = FRAMES[frame];

	return (
		<div className={styles.overlay}>
			<div className={styles.content}>
				{/* Pixel grid - each div is one "pixel" */}
				<div className={styles.grid}>
					{pixels.map((color, i) => (
						<div
							key={i}
							className={`${styles.pixel} ${color === 1 ? styles.red : color === 2 ? styles.blue : ""}`}
						/>
					))}
				</div>

				{/* Loading text */}
				<span className={styles.text}>Loading...</span>
			</div>
		</div>
	);
}
