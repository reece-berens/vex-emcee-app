import { Geist, Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
    title: "VEX Emcee",
    description: "Description in progress.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="layout">
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
