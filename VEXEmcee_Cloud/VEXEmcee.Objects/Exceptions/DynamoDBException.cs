namespace VEXEmcee.Objects.Exceptions
{
	public class DynamoDBException : VEXEmceeBaseException
	{
		private static string _exceptionType = "DynamoDBException";

		public DynamoDBException(int location, string message) : base(location, message, _exceptionType)
		{

		}

		public DynamoDBException(int location, string message, Exception inner) : base(location, message, _exceptionType, inner)
		{

		}
	}
}
