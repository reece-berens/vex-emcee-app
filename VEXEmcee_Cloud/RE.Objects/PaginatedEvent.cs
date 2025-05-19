namespace RE.Objects
{
    public class PaginatedEvent
    {
        public PageMeta Meta { get; set; }
        public List<Event> Data { get; set; }
    }
}