import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata = {
    title: "VEX Emcee",
    description: "Description in progress.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="layout">
                <Header />
                <div style={{flexGrow: "1"}}>
                    {children}
                </div>
                <Footer />
            </body>
        </html>
    );
}
