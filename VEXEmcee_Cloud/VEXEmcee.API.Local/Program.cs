
namespace VEXEmcee.API.Local
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var builder = WebApplication.CreateBuilder(args);

			// Add services to the container.

			builder.Services.AddControllers();
			// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
			builder.Services.AddEndpointsApiExplorer();
			builder.Services.AddSwaggerGen();

			var app = builder.Build();

			// Configure the HTTP request pipeline.
			if (app.Environment.IsDevelopment())
			{
				app.UseSwagger();
				app.UseSwaggerUI();

				RE.API.Accessor.SetAccessToken(builder.Configuration.GetValue<string>("RE.API.AccessToken") ?? string.Empty);

				DB.Dynamo.Dynamo.Initialize(
					builder.Configuration.GetValue<string>("AWS.AccessToken") ?? string.Empty,
					builder.Configuration.GetValue<string>("AWS.SecretToken") ?? string.Empty
				);
			}

			app.UseAuthorization();


			app.MapControllers();

			app.Run();
		}
	}
}
