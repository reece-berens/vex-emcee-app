namespace RE.Objects
{
    public class PaginatedSeason
    {
        public PageMeta Meta { get; set; }
        public List<Season> Data { get; set; }
    }
}