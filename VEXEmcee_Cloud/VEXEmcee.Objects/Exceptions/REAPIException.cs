namespace VEXEmcee.Objects.Exceptions
{
	public class REAPIException : VEXEmceeBaseException
	{
		public REAPIException(int location, string message) : base(location, message)
		{

		}

		public REAPIException(int location, string message, Exception inner) : base(location, message, inner)
		{

		}
	}
}
