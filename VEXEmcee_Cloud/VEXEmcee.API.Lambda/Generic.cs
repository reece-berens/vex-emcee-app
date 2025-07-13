using Amazon.Lambda.Core;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace VEXEmcee.API.Lambda
{
	public static class Generic
	{
		internal static readonly string REAPIParamStoreKey = "/VEXEmcee/RE/APIKey";
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
	}
}
