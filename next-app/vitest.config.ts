import { defineConfig } from "vitest/config";

/**
 * Vitest configuration
 *
 * Tests are grouped into projects so each group gets only the environment it needs.
 * - unit: plain functions (parsers, highlights, demo data builders) run in Node, with no DOM.
 */
export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "unit",
					environment: "node",
					include: ["app/**/*.test.{js,ts}"],
				},
			},
		],
	},
});
