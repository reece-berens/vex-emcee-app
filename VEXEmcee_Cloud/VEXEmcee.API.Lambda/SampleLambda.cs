using Amazon.Lambda.Core;
using System.Text.Json;

namespace VEXEmcee.API.Lambda
{
	public class SampleLambda
	{
		public SampleLambda()
		{
			Console.WriteLine("Inside constructor of SampleLambda");
		}

		public void FunctionHandler(object request, ILambdaContext context)
		{
			Console.WriteLine("Inside FunctionHandler of SampleLambda");
			Console.WriteLine(request.GetType().FullName);
			Console.WriteLine(JsonSerializer.Serialize(request));
			
			Console.WriteLine(request);
			Console.WriteLine(context);
		}
	}
}
