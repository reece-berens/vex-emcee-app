/**
 * Demo data source: sample data with a short fake delay, and no network calls.
 * For now it serves the old mock data; step 2.2 replaces that with the new demo data.
 */
import {
	getMockTeamListResponse,
	getMockTeamInfoResponse,
	getMockMatchListResponse,
	getMockMatchInfoResponse,
} from "../mockData";
import type { DataSourceFunctions } from "./types";

// Fake network delay, so the loading skeletons show like they would on a real connection
const DEMO_DELAY_MS = 2000;
const demoDelay = () => new Promise(resolve => setTimeout(resolve, DEMO_DELAY_MS));

const demo: DataSourceFunctions = {
	GetMatchInfo: async request => {
		await demoDelay();
		return getMockMatchInfoResponse(request.MatchKey);
	},
	GetMatchList: async () => {
		await demoDelay();
		return getMockMatchListResponse();
	},
	GetTeamInfo: async request => {
		await demoDelay();
		return getMockTeamInfoResponse(request.TeamID);
	},
	GetTeamList: async () => {
		await demoDelay();
		return getMockTeamListResponse();
	},
};

export default demo;
