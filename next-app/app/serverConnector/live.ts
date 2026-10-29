/**
 * Live data source: the real VEX Emcee API connectors, grouped in one object.
 */
import GetMatchInfo from "./matchInfo";
import GetMatchList from "./matchList";
import GetTeamInfo from "./teamInfo";
import GetTeamList from "./teamList";
import type { DataSourceFunctions } from "./types";

const live: DataSourceFunctions = {
	GetMatchInfo,
	GetMatchList,
	GetTeamInfo,
	GetTeamList,
};

export default live;
