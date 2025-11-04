namespace VEXEmcee {
    namespace API {
        namespace Responses {
            interface BaseResponse {
                ErrorMessage: string;
                Success: boolean;
            }

            interface GetMatchInfoResponse<T extends VEXEmcee.API.Objects.MatchInfo.Base = VEXEmcee.API.Objects.MatchInfo.Base> extends BaseResponse {
                EventStatsLoading?: boolean;
                MatchInfo?: T;
                ProgramAbbreviation?: string;
            }

            interface GetMatchListResponse<T extends VEXEmcee.API.Objects.MatchList.Base = VEXEmcee.API.Objects.MatchList.Base> extends BaseResponse {
                EventStatsLoading?: boolean;
                Matches?: T[];
                ProgramAbbreviation?: string;
            }

            interface GetREEventListResponse extends BaseResponse {
                Events?: VEXEmcee.API.Objects.REEvent[];
                NextPage?: number;
                PageSize?: number;
                TotalCount?: number;
            }

            interface GetSelectableProgramsResponse extends BaseResponse {
                Programs?: VEXEmcee.API.Objects.Program[];
            }

            interface GetTeamInfoResponse extends BaseResponse {
                EventStatsLoading?: boolean;
                TeamInfo?: VEXEmcee.API.Objects.TeamInfo;
                ProgramAbbreviation?: string;
            }

            interface GetTeamListResponse<T extends VEXEmcee.API.Objects.TeamList.Base = VEXEmcee.API.Objects.TeamList.Base> extends BaseResponse {
                EventStatsLoading?: boolean;
                Teams?: T[];
                ProgramAbbreviation?: string;
            }

            interface RegisterNewSessionResponse extends BaseResponse {
                Session?: string;
            }

            interface RegisterSessionEventDivisionResponse extends BaseResponse {

            }
        }
    }
}
