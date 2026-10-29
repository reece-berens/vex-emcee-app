// import RegisterNewSession from "./session"

import { DATA_SOURCE } from "./dataSource";
import demo from "./demo";
import live from "./live";

// Pick the data source once. Pages call the same functions either way,
// and get the same response shapes, so they never need to know which one it is.
const source = DATA_SOURCE === "live" ? live : demo;

// Named before exporting, so stack traces and React DevTools show a real name
// (this is what the import/no-anonymous-default-export lint rule asks for)
const ServerConnector = {
	GetEventList: source.GetEventList,
	GetMatchInfo: source.GetMatchInfo,
	GetMatchList: source.GetMatchList,
	GetPrograms: source.GetPrograms,
	// RegisterNewSession,
	RegisterEventDivision: source.RegisterEventDivision,
	GetTeamInfo: source.GetTeamInfo,
	GetTeamList: source.GetTeamList,
};

export default ServerConnector;
