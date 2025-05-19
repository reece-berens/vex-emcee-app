namespace RE.Objects
{
    public class Season
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IdInfo Program { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public int Years_Start { get; set; }
        public int Years_End { get; set; }
    }
}