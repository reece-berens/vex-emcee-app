namespace RE.Objects
{
	public class Team
	{
		public int Id { get; set; }
		public string Number { get; set; }
		public string Team_Name { get; set; }
		public string Robot_Name { get; set; }
		public string Organization { get; set; }
		public Location Location { get; set; }
		public bool Registered { get; set; }
		public IdInfo Program { get; set; }
		public Grade Grade { get; set; }
	}
}
