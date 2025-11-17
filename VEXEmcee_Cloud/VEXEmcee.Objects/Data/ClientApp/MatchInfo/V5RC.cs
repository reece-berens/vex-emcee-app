namespace VEXEmcee.Objects.Data.ClientApp.MatchInfo
{
	public class V5RC : Base
	{
		public V5RC_Alliance Blue { get; set; }
		public bool BlueWin { get; set; }
		public V5RC_Alliance Red { get; set; }
		public bool RedWin { get; set; }
		public bool Tie { get; set; }
	}
}
