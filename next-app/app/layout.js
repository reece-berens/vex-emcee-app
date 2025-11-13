import "./globals.css";
import Footer from "./components/Footer";
import ScrollWrapper from "./components/ScrollWrapper";

export const metadata = {
	title: "VEX Emcee",
	description: "Description in progress.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="layout">
				<ScrollWrapper pageTitle="Find Your VEX Tournament">{children}</ScrollWrapper>
				<Footer />
			</body>
		</html>
	);
}
