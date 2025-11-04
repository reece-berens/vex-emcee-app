import Cookies from 'js-cookie';

const GetProgramList = async (request: VEXEmcee.API.Requests.GetSelectableProgramsRequest): Promise<VEXEmcee.API.Responses.GetSelectableProgramsResponse> => {
    const builtURL = new URL("selectableprograms", process.env.NEXT_PUBLIC_BASE_URL);
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

export default GetProgramList;
