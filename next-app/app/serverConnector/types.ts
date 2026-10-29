/**
 * The functions every data source provides. demo.ts and live.ts are both typed
 * with this, so TypeScript reports an error if one of them drifts from the other.
 */
export interface DataSourceFunctions {
	GetMatchInfo: (
		request: VEXEmcee.API.Requests.GetMatchInfoRequest,
	) => Promise<VEXEmcee.API.Responses.GetMatchInfoResponse>;
	GetMatchList: (
		request: VEXEmcee.API.Requests.GetMatchListRequest,
	) => Promise<VEXEmcee.API.Responses.GetMatchListResponse>;
	GetTeamInfo: (
		request: VEXEmcee.API.Requests.GetTeamInfoRequest,
	) => Promise<VEXEmcee.API.Responses.GetTeamInfoResponse>;
	GetTeamList: (
		request: VEXEmcee.API.Requests.GetTeamListRequest,
	) => Promise<VEXEmcee.API.Responses.GetTeamListResponse>;
}
