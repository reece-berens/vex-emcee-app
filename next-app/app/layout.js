/**
 * Root Layout
 *
 * The top-level layout component that wraps all pages in the app.
 * This is a Next.js App Router convention - layout.js in the app directory
 * wraps all pages and nested layouts.
 *
 * Structure:
 * - Imports global CSS (applied to entire app)
 * - Sets up AppWrapper which provides global context
 * - Renders BottomNav as the footer (passed as prop to stay outside scroll area)
 *
 * Note: This is a Server Component by default, but AppWrapper is a Client Component
 * so the children will be rendered on the client side.
 */

import "./globals.css";
import BottomNav from "./components/BottomNav";
import AppWrapper from "./components/AppWrapper";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
});

/** Next.js metadata - used for <title> and <meta> tags */
export const metadata = {
	title: "VEX Emcee",
	description: "Description in progress.",
};

/**
 * @param {React.ReactNode} children - Page content (from page.js files)
 */
export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${spaceGrotesk.variable}`}
		>
			<body className="layout">
				{/* AppWrapper provides global state context
				    Footer is passed as prop so it renders outside the scroll area */}
				<AppWrapper footer={<BottomNav />}>{children}</AppWrapper>
			</body>
		</html>
	);
}
