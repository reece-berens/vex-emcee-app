import Cookies from 'js-cookie';

const GetMatchList = async (request: VEXEmcee.API.Requests.GetMatchListRequest): Promise<VEXEmcee.API.Responses.GetMatchListResponse> => {
    const builtURL = new URL("matches", process.env.NEXT_PUBLIC_BASE_URL);
    const session = Cookies.get('VEXEmceeSession') || '';

    const fetchResult = await fetch(builtURL, {
        method: "GET",
        headers: {
            'VEXEmceeSession': session
        }
    });

    if (fetchResult.ok) {
        const resultData = await fetchResult.json();
        const tempThing = resultData as VEXEmcee.API.Responses.GetMatchListResponse;
        return tempThing;
    }
    else {
        const errorMessage: VEXEmcee.API.Responses.GetMatchListResponse = {
            ErrorMessage: `ERROR getting data: ${fetchResult.statusText}`,
            Success: false,
        };
        return errorMessage;
    }
}

export default GetMatchList;
