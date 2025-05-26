namespace RE.Objects
{
	public class Location
	{
		public string Venue { get; set; }
		public string Address_1 { get; set; }
		public string Address_2 { get; set; }
		public string City { get; set; }
		public string Region { get; set; }
		public string Postcode { get; set; }
		public string Country { get; set; }
		public Coordinates Coordinates { get; set; }
	}
}
