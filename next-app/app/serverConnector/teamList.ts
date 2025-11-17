import Cookies from 'js-cookie';

const GetTeamList = async (request: VEXEmcee.API.Requests.GetTeamListRequest): Promise<VEXEmcee.API.Responses.GetTeamListResponse> => {
    const builtURL = new URL("teams", process.env.NEXT_PUBLIC_BASE_URL);
    const session = Cookies.get('VEXEmceeSession') || '';

    const fetchResult = await fetch(builtURL, {
        method: "GET",
        headers: {
            'VEXEmceeSession': session
        }
    });

    if (fetchResult.ok) {
        const resultData = await fetchResult.json();
        const tempThing = resultData as VEXEmcee.API.Responses.GetTeamListResponse;
        return tempThing;
    }
    else {
        const errorMessage: VEXEmcee.API.Responses.GetTeamListResponse = {
            ErrorMessage: `ERROR getting data: ${fetchResult.statusText}`,
            Success: false,
        };
        return errorMessage;
    }
}

export default GetTeamList;
