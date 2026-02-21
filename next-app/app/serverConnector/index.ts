import GetEventList from "./eventList";
import GetMatchInfoReal from "./matchInfo";
import GetMatchListReal from "./matchList";
// import GetProgramList from "./programs"
import RegisterEventDivision from "./registerEventDivision";
// import RegisterNewSession from "./session"
import GetTeamInfoReal from "./teamInfo";
import GetTeamListReal from "./teamList";

import {
	USE_MOCK_DATA,
	getMockTeamListResponse,
	getMockTeamInfoResponse,
	getMockMatchListResponse,
	getMockMatchInfoResponse,
} from "../mockData";

// Fake delay for mock data testing
const MOCK_DELAY_MS = 2000;
const mockDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

// Wrap API functions to use mock data when enabled
const GetTeamList = async (request) => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockTeamListResponse();
	}
	return GetTeamListReal(request);
};

const GetTeamInfo = async (request) => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockTeamInfoResponse(request.TeamID);
	}
	return GetTeamInfoReal(request);
};

const GetMatchList = async (request) => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockMatchListResponse();
	}
	return GetMatchListReal(request);
};

const GetMatchInfo = async (request) => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockMatchInfoResponse(request.MatchKey);
	}
	return GetMatchInfoReal(request);
};

export default {
	GetEventList,
	GetMatchInfo,
	GetMatchList,
	// GetProgramList,
	RegisterEventDivision,
	// RegisterNewSession,
	GetTeamInfo,
	GetTeamList,
};
