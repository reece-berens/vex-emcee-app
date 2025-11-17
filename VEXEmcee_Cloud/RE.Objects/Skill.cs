namespace RE.Objects
{
	public class Skill
	{
		public int Id { get; set; }
		public IdInfo Event { get; set; }
		public IdInfo Team { get; set; }
		public SkillType Type { get; set; }
		public IdInfo Season { get; set; }
		public IdInfo Division { get; set; }
		public int Rank { get; set; }
		public int Score { get; set; }
		public int? Attempts { get; set; }
	}
}
