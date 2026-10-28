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

// Wrap API functions to use mock data when enabled.
// Each wrapper takes and returns the same types as the real connector it wraps,
// so pages get the same shape whether the data is mock or real.
const GetTeamList = async (
	request: VEXEmcee.API.Requests.GetTeamListRequest = {},
): Promise<VEXEmcee.API.Responses.GetTeamListResponse> => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockTeamListResponse();
	}
	return GetTeamListReal(request);
};

const GetTeamInfo = async (
	request: VEXEmcee.API.Requests.GetTeamInfoRequest,
): Promise<VEXEmcee.API.Responses.GetTeamInfoResponse> => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockTeamInfoResponse(request.TeamID);
	}
	return GetTeamInfoReal(request);
};

const GetMatchList = async (
	request: VEXEmcee.API.Requests.GetMatchListRequest = {},
): Promise<VEXEmcee.API.Responses.GetMatchListResponse> => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockMatchListResponse();
	}
	return GetMatchListReal(request);
};

const GetMatchInfo = async (
	request: VEXEmcee.API.Requests.GetMatchInfoRequest,
): Promise<VEXEmcee.API.Responses.GetMatchInfoResponse> => {
	if (USE_MOCK_DATA) {
		await mockDelay();
		return getMockMatchInfoResponse(request.MatchKey);
	}
	return GetMatchInfoReal(request);
};

// Named before exporting, so stack traces and React DevTools show a real name
// (this is what the import/no-anonymous-default-export lint rule asks for)
const ServerConnector = {
	GetEventList,
	GetMatchInfo,
	GetMatchList,
	// GetProgramList,
	RegisterEventDivision,
	// RegisterNewSession,
	GetTeamInfo,
	GetTeamList,
};

export default ServerConnector;
