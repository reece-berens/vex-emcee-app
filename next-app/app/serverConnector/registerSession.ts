import Cookies from 'js-cookie';

const RegisterNewSession = async (request: VEXEmcee.API.Requests.RegisterNewSessionRequest): Promise<VEXEmcee.API.Responses.RegisterNewSessionResponse> => {
    const builtURL = new URL("register", process.env.NEXT_PUBLIC_BASE_URL);
    const session = Cookies.get('VEXEmceeSession') || '';

    const fetchResult = await fetch(builtURL, {
        method: "POST",
        headers: {
            'VEXEmceeSession': session,
            'Content-Type': 'application/json'
        }
    });

    if (fetchResult.ok) {
        const resultData = await fetchResult.json();
        const tempThing = resultData as VEXEmcee.API.Responses.RegisterNewSessionResponse;
        return tempThing;
    }
    else {
        const errorMessage: VEXEmcee.API.Responses.RegisterNewSessionResponse = {
            ErrorMessage: `ERROR posting data: ${fetchResult.statusText}`,
            Success: false,
        };
        return errorMessage;
    }
}

export default RegisterNewSession;
