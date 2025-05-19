namespace RE.Objects
{
    public class PaginatedSkill
    {
        public PageMeta Meta { get; set; }
        public List<Skill> Data { get; set; }
    }
}