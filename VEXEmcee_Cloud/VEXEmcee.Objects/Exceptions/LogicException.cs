namespace VEXEmcee.Objects.Exceptions
{
	public class LogicException : VEXEmceeBaseException
	{
		private static string _exceptionType = "LogicException";

		public LogicException(int location, string message) : base(location, message, _exceptionType)
		{

		}

		public LogicException(int location, string message, Exception inner) : base(location, message, _exceptionType, inner)
		{

		}
	}
}
