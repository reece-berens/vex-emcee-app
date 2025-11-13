"use client";
import { useRef, useState, useEffect, createContext, useContext } from "react";
import Header from "./Header";

const ScrollContext = createContext(0);
const TitleContext = createContext({
	title: "VEX Emcee",
	setTitle: () => {},
});

export const useScrollY = () => useContext(ScrollContext);
export const usePageTitle = () => useContext(TitleContext).title;
export const useSetPageTitle = () => useContext(TitleContext).setTitle;

export default function ScrollWrapper({ children }) {
	const [scrollY, setScrollY] = useState(0);
	const [pageTitle, setPageTitle] = useState("VEX Emcee");
	const scrollContainerRef = useRef(null);

	useEffect(() => {
		const handleScroll = () => {
			if (scrollContainerRef.current) {
				setScrollY(scrollContainerRef.current.scrollTop);
			}
		};

		const element = scrollContainerRef.current;
		element?.addEventListener("scroll", handleScroll);

		return () => element?.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<ScrollContext.Provider value={scrollY}>
			<TitleContext.Provider value={{ title: pageTitle, setTitle: setPageTitle }}>
				<div
					ref={scrollContainerRef}
					className="scroll-wrapper"
				>
					<Header scrollY={scrollY} />
					{children}
				</div>
			</TitleContext.Provider>
		</ScrollContext.Provider>
	);
}
