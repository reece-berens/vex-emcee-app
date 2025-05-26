namespace VEXEmcee.Objects.Exceptions
{
	public class VEXEmceeBaseException : Exception
	{
		public VEXEmceeBaseException(int location, string message) : base(message)
		{

		}

		public VEXEmceeBaseException(int location, string message, Exception inner) : base(message, inner)
		{

		}
	}
}
