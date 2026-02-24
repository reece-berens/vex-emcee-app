"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSetPageTitle, useScrollY, useEventRegistered, useRefreshKey } from "../../components/AppWrapper";
import ServerConnector from "../../serverConnector";
import LoadingOverlay from "../../components/LoadingOverlay";
import styles from "./TeamDetails.module.css";

export default function TeamDetail() {
	const { id } = useParams();
	const router = useRouter();
	const [team, setTeam] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTeam = async () => {
			const result = await ServerConnector.GetTeamInfo({ TeamID: Number(id) });
			if (result.Success) {
				setTeam(result.TeamInfo);
			}
			setLoading(false);
		};
		fetchTeam();
	}, [id]);

	return (
		<div className={styles.page}>
			<button onClick={() => router.back()}>Back</button>
			<p>Team ID: {id}</p>
			{loading && <p>Loading...</p>}
			{team && <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>{JSON.stringify(team, null, 2)}</pre>}
		</div>
	);
}
