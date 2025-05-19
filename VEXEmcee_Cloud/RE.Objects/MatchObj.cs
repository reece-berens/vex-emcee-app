namespace RE.Objects
{
    public class MatchObj
    {
        public int Id { get; set; }
        public IdInfo Event { get; set; }
        public IdInfo Division { get; set; }
        public int Round { get; set; }
        public int Instance { get; set; }
        public int Matchnum { get; set; }
        public DateTime Scheduled { get; set; }
        public DateTime Started { get; set; }
        public string Field { get; set; }
        public bool Scored { get; set; }
        public string Name { get; set; }
        public List<Alliance> Alliances { get; set; }
    }
}