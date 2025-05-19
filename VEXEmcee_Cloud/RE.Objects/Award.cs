namespace RE.Objects
{
    public class Award
    {
        public int Id { get; set; }
        public IdInfo Event { get; set; }
        public int Order { get; set; }
        public string Title { get; set; }
        public List<string> Qualifications { get; set; }
        public string Designation { get; set; }
        public string Classification { get; set; }
        public List<TeamAwardWinner> TeamWinners { get; set; }
        public List<string> IndividualWinners { get; set; }
    }
}