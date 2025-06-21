using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VEXEmcee.Logic.InternalLogic
{
	internal class Program
	{
		/// <summary>
		/// Gets a list of selectable programs.
		/// </summary>
		/// <param name="request">The request containing parameters for fetching selectable programs.</param>
		/// <returns>A list of selectable programs.</returns>
		public static async Task<List<DB.Dynamo.Definitions.Program>> GetSelectablePrograms()
		{
			return await DB.Dynamo.Accessors.Program.GetSelectableProgramList();
		}
	}
}
