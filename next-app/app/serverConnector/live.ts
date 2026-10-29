/**
 * Live data source: the real VEX Emcee API connectors, grouped in one object.
 */
import GetEventListReal from "./eventList";
import GetMatchInfoReal from "./matchInfo";
import GetMatchListReal from "./matchList";
import { getPrograms } from "./programs";
import RegisterEventDivisionReal from "./registerEventDivision";
import GetTeamInfoReal from "./teamInfo";
import GetTeamListReal from "./teamList";
import type { DataSourceFunctions } from "./types";

const MISSING_URL_MESSAGE =
	"Live mode needs NEXT_PUBLIC_BASE_URL. Set it in .env.local, or set NEXT_PUBLIC_DATA_SOURCE=demo.";

const hasBaseUrl = Boolean(process.env.NEXT_PUBLIC_BASE_URL);

// Without a base URL, every request would fail with a vague network error.
// Return a failed response with a clear message instead. The pages already show ErrorMessage.
const requireBaseUrl = <Req, Res extends VEXEmcee.API.Responses.BaseResponse>(
	connector: (request: Req) => Promise<Res>,
): ((request: Req) => Promise<Res>) => {
	return async request => {
		if (!hasBaseUrl) {
			console.error(MISSING_URL_MESSAGE);
			return { Success: false, ErrorMessage: MISSING_URL_MESSAGE } as Res;
		}
		return connector(request);
	};
};

const live: DataSourceFunctions = {
	GetEventList: requireBaseUrl(GetEventListReal),
	GetMatchInfo: requireBaseUrl(GetMatchInfoReal),
	GetMatchList: requireBaseUrl(GetMatchListReal),
	// getPrograms reports errors as { success, error }, which is what the program dropdown reads
	GetPrograms: async () => {
		if (!hasBaseUrl) {
			console.error(MISSING_URL_MESSAGE);
			return { success: false, error: MISSING_URL_MESSAGE };
		}
		return getPrograms();
	},
	GetTeamInfo: requireBaseUrl(GetTeamInfoReal),
	GetTeamList: requireBaseUrl(GetTeamListReal),
	RegisterEventDivision: requireBaseUrl(RegisterEventDivisionReal),
};

export default live;
