"use client";

import api from '../serverConnector';
import Cookies from 'js-cookie';

const wrap = {
    // The serverConnector functions already attach the session as a header (VEXEmceeSession).
    // The client wrapper will pass through the request object without injecting Session into the body.
    RegisterNewSession: async (req?: Partial<VEXEmcee.API.Requests.RegisterNewSessionRequest>): Promise<VEXEmcee.API.Responses.RegisterNewSessionResponse> => {
        return await api.RegisterNewSession((req || {}) as any);
    },
    GetProgramList: async (req?: Partial<VEXEmcee.API.Requests.GetSelectableProgramsRequest>): Promise<VEXEmcee.API.Responses.GetSelectableProgramsResponse> => {
        return await api.GetProgramList((req || {}) as any);
    },
    GetEventList: async (req?: Partial<VEXEmcee.API.Requests.GetREEventListRequest>): Promise<VEXEmcee.API.Responses.GetREEventListResponse> => {
        return await api.GetEventList((req || {}) as any);
    },
    RegisterEventDivision: async (req?: Partial<VEXEmcee.API.Requests.RegisterSessionEventDivisionRequest>): Promise<VEXEmcee.API.Responses.RegisterSessionEventDivisionResponse> => {
        return await api.RegisterEventDivision((req || {}) as any);
    },
    GetMatchList: async (req?: Partial<VEXEmcee.API.Requests.GetMatchListRequest>): Promise<VEXEmcee.API.Responses.GetMatchListResponse> => {
        return await api.GetMatchList((req || {}) as any);
    },
    GetMatchInfo: async (req?: Partial<VEXEmcee.API.Requests.GetMatchInfoRequest>): Promise<VEXEmcee.API.Responses.GetMatchInfoResponse> => {
        return await api.GetMatchInfo((req || {}) as any);
    },
    GetTeamList: async (req?: Partial<VEXEmcee.API.Requests.GetTeamListRequest>): Promise<VEXEmcee.API.Responses.GetTeamListResponse> => {
        return await api.GetTeamList((req || {}) as any);
    },
    GetTeamInfo: async (req?: Partial<VEXEmcee.API.Requests.GetTeamInfoRequest>): Promise<VEXEmcee.API.Responses.GetTeamInfoResponse> => {
        return await api.GetTeamInfo((req || {}) as any);
    },
    getSessionToken: (): string | undefined => Cookies.get('VEXEmceeSession'),
    clearSession: () => Cookies.remove('VEXEmceeSession')
}

export default wrap;
