namespace RE.Objects
{
    public class PaginatedTeam
    {
        public PageMeta Meta { get; set; }
        public List<Team> Data { get; set; }
    }
}