import Cookies from 'js-cookie';

const GetMatchInfo = async (request: VEXEmcee.API.Requests.GetMatchInfoRequest): Promise<VEXEmcee.API.Responses.GetMatchInfoResponse> => {
    const builtURL = new URL("matchInfo", process.env.NEXT_PUBLIC_BASE_URL);
    builtURL.searchParams.append("matchKey", request.MatchKey.toString());
    const session = Cookies.get('VEXEmceeSession') || '';

    const fetchResult = await fetch(builtURL, {
        method: "GET",
        headers: {
            'VEXEmceeSession': session
        }
    });

    if (fetchResult.ok) {
        const resultData = await fetchResult.json();
        const tempThing = resultData as VEXEmcee.API.Responses.GetMatchInfoResponse;
        return tempThing;
    }
    else {
        const errorMessage: VEXEmcee.API.Responses.GetMatchInfoResponse = {
            ErrorMessage: `ERROR getting data: ${fetchResult.statusText}`,
            Success: false
        };
        return errorMessage;
    }
}

export default GetMatchInfo;
