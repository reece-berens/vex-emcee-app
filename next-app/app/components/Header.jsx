import { usePageTitle } from "./ScrollWrapper";

export default function Header({ scrollY }) {
	const title = usePageTitle();
	const previewTextOpacity = Math.min(Math.max((scrollY - 28) / 2, 0), 1);
	const headerOpacity = Math.min(Math.max((scrollY - 48) / 16, 0), 1);

	return (
		<>
			{/* Preview text - appears early */}
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: "53px", // same as header without border
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1000,
					opacity: previewTextOpacity,
					pointerEvents: "none",
				}}
			>
				<h3 className="text-bold text-base">{title}</h3>
			</div>

			{/* Real header - appears later and covers preview */}
			<header
				className="layout-header"
				style={{ opacity: headerOpacity }}
			>
				<h3 className="text-bold text-base">{title}</h3>
			</header>
		</>
	);
}
