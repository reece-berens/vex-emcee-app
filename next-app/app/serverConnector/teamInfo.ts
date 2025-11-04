import Cookies from 'js-cookie';

const GetTeamInfo = async (request: VEXEmcee.API.Requests.GetTeamInfoRequest): Promise<VEXEmcee.API.Responses.GetTeamInfoResponse> => {
    const builtURL = new URL("teamInfo", process.env.NEXT_PUBLIC_BASE_URL);
    builtURL.searchParams.append("teamID", request.TeamID.toString());
    const session = Cookies.get('VEXEmceeSession') || '';

    const fetchResult = await fetch(builtURL, {
        method: "GET",
        headers: {
            'VEXEmceeSession': session
        }
    });

    if (fetchResult.ok) {
        const resultData = await fetchResult.json();
        const tempThing = resultData as VEXEmcee.API.Responses.GetTeamInfoResponse;
        return tempThing;
    }
    else {
        const errorMessage: VEXEmcee.API.Responses.GetTeamInfoResponse = {
            ErrorMessage: `ERROR getting data: ${fetchResult.statusText}`,
            Success: false
        };
        return errorMessage;
    }
}

export default GetTeamInfo;
