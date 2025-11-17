import Cookies from 'js-cookie';

const RegisterEventDivision = async (request: VEXEmcee.API.Requests.RegisterSessionEventDivisionRequest): Promise<VEXEmcee.API.Responses.RegisterSessionEventDivisionResponse> => {
    const builtURL = new URL("registerEventDivision", process.env.NEXT_PUBLIC_BASE_URL);
    const session = Cookies.get('VEXEmceeSession') || '';

    const fetchResult = await fetch(builtURL, {
        method: "POST",
        headers: {
            'VEXEmceeSession': session,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    if (fetchResult.ok) {
        const resultData = await fetchResult.json();
        const tempThing = resultData as VEXEmcee.API.Responses.RegisterSessionEventDivisionResponse;
        return tempThing;
    }
    else {
        const errorMessage: VEXEmcee.API.Responses.RegisterSessionEventDivisionResponse = {
            ErrorMessage: `ERROR posting data: ${fetchResult.statusText}`,
            Success: false
        };
        return errorMessage;
    }
}

export default RegisterEventDivision;
