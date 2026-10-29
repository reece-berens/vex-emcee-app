/**
 * Demo data source: the sample tournament in app/demoData, with a short fake delay and no network calls.
 */
import { buildMatchInfo, buildMatchList, buildTeamInfo, buildTeamList } from "../demoData/build";
import type { DataSourceFunctions } from "./types";

// Fake network delay, long enough for the loading skeletons to show
const DEMO_DELAY_MS = 400;
const demoDelay = () => new Promise(resolve => setTimeout(resolve, DEMO_DELAY_MS));

const demo: DataSourceFunctions = {
	GetMatchInfo: async request => {
		await demoDelay();
		return buildMatchInfo(request.MatchKey);
	},
	GetMatchList: async () => {
		await demoDelay();
		return buildMatchList();
	},
	GetTeamInfo: async request => {
		await demoDelay();
		return buildTeamInfo(request.TeamID);
	},
	GetTeamList: async () => {
		await demoDelay();
		return buildTeamList();
	},
};

export default demo;
