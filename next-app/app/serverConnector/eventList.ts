import Cookies from 'js-cookie';

const GetEventList = async (request: VEXEmcee.API.Requests.GetREEventListRequest): Promise<VEXEmcee.API.Responses.GetREEventListResponse> => {
    const builtURL = new URL("events", process.env.NEXT_PUBLIC_BASE_URL);
    if (request.Page || request.Page === 0) {
        builtURL.searchParams.append("page", request.Page.toString());
    }
    if (request.PageSize) {
        builtURL.searchParams.append("pageSize", request.PageSize.toString());
    }
    if (request.ProgramID) {
        builtURL.searchParams.append("programID", request.ProgramID.toString());
    }
    if (request.Region) {
        builtURL.searchParams.append("region", request.Region);
    }
    if (request.SKU) {
        builtURL.searchParams.append("sku", request.SKU);
    }

    const session = Cookies.get('VEXEmceeSession') || '';
    const fetchResult = await fetch(builtURL, {
        method: "GET",
        headers: {
            'VEXEmceeSession': session
        }
    });

    if (fetchResult.ok) {
        const resultData = await fetchResult.json();
        const tempThing = resultData as VEXEmcee.API.Responses.GetREEventListResponse;
        return tempThing;
    }
    else {
        const errorMessage: VEXEmcee.API.Responses.GetREEventListResponse = {
            ErrorMessage: `ERROR getting data: ${fetchResult.statusText}`,
            Success: false
        };
        return errorMessage;
    }
}

export default GetEventList;
