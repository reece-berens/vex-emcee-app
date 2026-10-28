namespace VEXEmcee {
    namespace API {
        namespace Requests {
            interface BaseRequest {
                Session: string;
            }

            interface GetMatchInfoRequest extends BaseRequest {
                MatchKey: string;
            }

            interface GetMatchListRequest extends BaseRequest {

            }

            interface GetREEventListRequest extends BaseRequest {
                PageSize?: number;
                Page?: number;
                ProgramID?: number;
                Region?: string;
                SKU?: string;
            }

            interface GetSelectableProgramsRequest extends BaseRequest {

            }

            interface GetTeamInfoRequest extends BaseRequest {
                TeamID: number;
            }

            interface GetTeamListRequest extends BaseRequest {

            }

            interface RegisterNewSessionRequest extends BaseRequest {

            }

            interface RegisterSessionEventDivisionRequest extends BaseRequest {
                DivisionID: number;
                EventID: number;
            }
        }
    }
}
