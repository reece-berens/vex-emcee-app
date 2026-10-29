import GetEventList from "./eventList";
// import GetProgramList from "./programs"
import RegisterEventDivision from "./registerEventDivision";
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
	// The home page imports these two directly
	GetEventList,
	RegisterEventDivision,
	// GetProgramList,
	// RegisterNewSession,
	GetMatchInfo: source.GetMatchInfo,
	GetMatchList: source.GetMatchList,
	GetTeamInfo: source.GetTeamInfo,
	GetTeamList: source.GetTeamList,
};

export default ServerConnector;
