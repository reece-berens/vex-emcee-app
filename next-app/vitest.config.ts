import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Vitest configuration
 *
 * Tests are grouped into projects so each group gets only the environment it needs.
 * - unit: plain functions (parsers, highlights, demo data builders) run in Node, with no DOM.
 * - components: React components rendered into jsdom, a simulated browser page, with React Testing Library.
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
			{
				plugins: [react()],
				test: {
					name: "components",
					environment: "jsdom",
					include: ["app/**/*.test.{jsx,tsx}"],
					setupFiles: ["./vitest.setup.js"],
				},
			},
		],
	},
});
