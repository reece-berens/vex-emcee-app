namespace RE.API
{
	internal class BaseDataResponse
	{
		internal bool WasSuccessful { get; set; }
		internal string Response { get; set; }
		internal RE.Objects.Error Error { get; set; }
	}
}
