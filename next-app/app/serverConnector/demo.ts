/**
 * Demo data source: the sample tournament in app/demoData, with a short fake delay and no network calls.
 */
import {
	buildEventList,
	buildMatchInfo,
	buildMatchList,
	buildPrograms,
	buildRegisterEventDivision,
	buildTeamInfo,
	buildTeamList,
} from "../demoData/build";
import type { DataSourceFunctions } from "./types";

// Fake network delay, long enough for the loading skeletons to show
const DEMO_DELAY_MS = 400;
const demoDelay = () => new Promise(resolve => setTimeout(resolve, DEMO_DELAY_MS));

const demo: DataSourceFunctions = {
	GetEventList: async request => {
		await demoDelay();
		return buildEventList(request);
	},
	GetMatchInfo: async request => {
		await demoDelay();
		return buildMatchInfo(request.MatchKey);
	},
	GetMatchList: async () => {
		await demoDelay();
		return buildMatchList();
	},
	GetPrograms: async () => {
		await demoDelay();
		return buildPrograms();
	},
	GetTeamInfo: async request => {
		await demoDelay();
		return buildTeamInfo(request.TeamID);
	},
	GetTeamList: async () => {
		await demoDelay();
		return buildTeamList();
	},
	RegisterEventDivision: async request => {
		await demoDelay();
		return buildRegisterEventDivision(request);
	},
};

export default demo;
