namespace VEXEmcee.Objects.Exceptions
{
	public class REAPIException : VEXEmceeBaseException
	{
		private static string _exceptionType = "REAPIException";

		public REAPIException(int location, string message) : base(location, message, _exceptionType)
		{

		}

		public REAPIException(int location, string message, Exception inner) : base(location, message, _exceptionType, inner)
		{

		}
	}
}
