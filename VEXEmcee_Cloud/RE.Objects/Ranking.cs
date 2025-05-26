namespace RE.Objects
{
	public class Ranking
	{
		public int Id { get; set; }
		public IdInfo Event { get; set; }
		public IdInfo Division { get; set; }
		public int Rank { get; set; }
		public IdInfo Team { get; set; }
		public int Wins { get; set; }
		public int Losses { get; set; }
		public int Ties { get; set; }
		public int WP { get; set; }
		public int AP { get; set; }
		public int SP { get; set; }
		public int High_Score { get; set; }
		public double Average_Points { get; set; }
		public int Total_Points { get; set; }
	}
}
