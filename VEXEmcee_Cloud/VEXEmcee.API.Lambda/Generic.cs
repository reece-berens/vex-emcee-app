using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace VEXEmcee.API.Lambda
{
	public static class Generic
	{
		internal static readonly string REAPIParamStoreKey = "/VEXEmcee/RE/APIKey";

		public static void BuildSessionInfo(Objects.API.Request.BaseRequest request, APIGatewayHttpApiV2ProxyRequest.AuthorizerDescription authorizer)
		{
			if (authorizer != null && authorizer.Lambda != null)
			{
				if (authorizer.Lambda.TryGetValue("DivisionID", out object divisionIDObj) && int.TryParse(divisionIDObj.ToString(), out int divisionID))
				{
					request.SessionDivisionID = divisionID;
				}
				if (authorizer.Lambda.TryGetValue("EventID", out object eventIDObj) && int.TryParse(eventIDObj.ToString(), out int eventID))
				{
					request.SessionEventID = eventID;
				}
			}
		}

		public static string GetSessionCookie(string[] cookieList)
		{
			if (cookieList == null || cookieList.Length == 0)
			{
				return null;
			}
			else
			{
				string thisSessionCookie = cookieList.Where(x => x.StartsWith("VEXEmceeSession=")).FirstOrDefault();
				if (string.IsNullOrWhiteSpace(thisSessionCookie))
				{
					return null;
				}
				else
				{
					return thisSessionCookie.Split('=')[1];
				}
			}
		}

		public static string GetSessionHeader(IDictionary<string, string> headers)
		{
			if (headers == null || !headers.TryGetValue("vexemceesession", out string headerValue))
			{
				return null;
			}
			else
			{
				return headerValue;
			}
		}
	}
}
