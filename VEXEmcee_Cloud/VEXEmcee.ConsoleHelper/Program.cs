namespace VEXEmcee.ConsoleHelper
{
	internal class Program
	{
		static async Task Main(string[] args)
		{
			Console.WriteLine("Hello, World!");

			/*
				This file is meant for populating data into the DynamoDB as needed
				In order to properly set up this console, create a file in this directory called "Launchpad.cs" that has the following format:
				```csharp
					namespace VEXEmcee.ConsoleHelper
					{
						public static class Launchpad
						{
							public static async Task Run()
							{
								// Your code here
							}
						}
					}
				```
				This file is intentionally left out of the repository to allow me to run whatever I want and hard-code in API keys without being committed to the repo
			*/
			await Launchpad.Run();
		}
	}
}
