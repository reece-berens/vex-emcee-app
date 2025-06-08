using System.Runtime.CompilerServices;

namespace VEXEmcee.Objects.Exceptions
{
	public class VEXEmceeBaseException : Exception
	{
		internal string ExceptionType { get; private set; }
		public int Location { get; private set; }

		public VEXEmceeBaseException(int location, string message, string exceptionType) : base(message)
		{
			this.ExceptionType = exceptionType;
			this.Location = location;
		}

		public VEXEmceeBaseException(int location, string message, string exceptionType, Exception inner) : base(message, inner)
		{
			this.ExceptionType = exceptionType;
			this.Location = location;
		}

		public void LogException([CallerMemberName] string memberName = null)
		{
			Console.WriteLine($"{this.ExceptionType} - {memberName} - {Location} - {this.Message}");
		}
	}
}
