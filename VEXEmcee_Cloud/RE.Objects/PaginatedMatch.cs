namespace RE.Objects
{
    public class PaginatedMatch
    {
        public PageMeta Meta { get; set; }
        public List<MatchObj> Data { get; set; }
    }
}