namespace RE.Objects
{
    public class PaginatedAward
    {
        public PageMeta Meta { get; set; }
        public List<Award> Data { get; set; }
    }
}