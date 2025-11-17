using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using System.Reflection;
using VEXEmcee.Objects.Exceptions;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	internal class Common
	{
		private static List<string> _existingTables = [];

		/// <summary>
		/// Ensures that the DynamoDB table associated with the specified type <typeparamref name="T"/> exists.
		/// If the table does not exist, attempts to create it using the hash and range key attributes defined on <typeparamref name="T"/>.
		/// Waits for the table to become active before proceeding. Caches validated table names to avoid redundant checks.
		/// Throws a <see cref="DynamoDBException"/> if table creation fails or times out.
		/// </summary>
		/// <typeparam name="T">
		/// The type decorated with <see cref="DynamoDBTableAttribute"/> representing the DynamoDB table schema.
		/// </typeparam>
		/// <exception cref="DynamoDBException">
		/// Thrown if table creation fails, times out, or encounters an error.
		/// </exception>
		internal static async Task ValidateTable<T>()
		{
			Type tType = typeof(T);
			DynamoDBTableAttribute tableAttribute = tType.GetCustomAttribute<DynamoDBTableAttribute>();
			if (tableAttribute != null && !_existingTables.Contains(tableAttribute.TableName))
			{
				bool createTable = false;
				try
				{
					DescribeTableResponse describeResult = await Dynamo.Client.DescribeTableAsync(tableAttribute.TableName);
					if (describeResult.Table == null)
					{
						Console.WriteLine($"Null table: Table {tableAttribute.TableName} does not exist. Creating it now...");
						createTable = true;
					}
				}
				catch (ResourceNotFoundException ex)
				{
					Console.WriteLine($"ResourceNotFoundException: Table {tableAttribute.TableName} does not exist. Creating it now...");
					Console.WriteLine(ex.Message);
					createTable = true;
				}
				
				if (createTable)
				{
					try
					{
						CreateTableRequest request = new()
						{
							TableName = tableAttribute.TableName,
							KeySchema = [],
							AttributeDefinitions = [],
							BillingMode = BillingMode.PAY_PER_REQUEST
						};
						PropertyInfo[] propInfoArr = tType.GetProperties();
						for (int i = 0; i < propInfoArr.Length && request.KeySchema.Count != 2; i++)
						{
							PropertyInfo prop = propInfoArr[i];
							DynamoDBHashKeyAttribute hashKeyAttr = prop.GetCustomAttribute<DynamoDBHashKeyAttribute>();
							if (hashKeyAttr != null) 
							{ 
								request.KeySchema.Add(new KeySchemaElement
								{
									AttributeName = prop.Name,
									KeyType = KeyType.HASH
								});
								request.AttributeDefinitions.Add(new()
								{
									AttributeName = prop.Name,
									AttributeType = GetAttributeType(prop.PropertyType)
								});
							}

							DynamoDBRangeKeyAttribute sortKeyAttr = prop.GetCustomAttribute<DynamoDBRangeKeyAttribute>();
							if (sortKeyAttr != null)
							{
								request.KeySchema.Add(new KeySchemaElement
								{
									AttributeName = prop.Name,
									KeyType = KeyType.RANGE
								});
								request.AttributeDefinitions.Add(new()
								{
									AttributeName = prop.Name,
									AttributeType = GetAttributeType(prop.PropertyType)
								});
							}
						}
					
						CreateTableResponse createTableResponse = await Dynamo.Client.CreateTableAsync(request);
						if (createTableResponse?.TableDescription?.TableStatus == TableStatus.CREATING)
						{
							DescribeTableResponse describeResponse;
							int createCountCheck = 0;
							do
							{
								await Task.Delay((int)Math.Pow(2, createCountCheck) * 1000);
								describeResponse = await Dynamo.Client.DescribeTableAsync(tableAttribute.TableName);
								createCountCheck++;
							} while (describeResponse.Table.TableStatus != TableStatus.ACTIVE && createCountCheck < 4);
							if (describeResponse.Table.TableStatus == TableStatus.ACTIVE)
							{
								Console.WriteLine($"Table {tableAttribute.TableName} created successfully.");
								_existingTables.Add(tableAttribute.TableName);
							}
							else
							{
								Console.WriteLine($"Table {tableAttribute.TableName} creation failed or timed out.");
								throw new DynamoDBException(1, $"Table {tableAttribute.TableName} creation failed or timed out. Try again later");
							}
						}
					}
					catch (Exception ex)
					{
						throw new DynamoDBException(2, $"Error creating table {tableAttribute.TableName}: {ex.Message}");
					}
				}
				else
				{
					_existingTables.Add(tableAttribute.TableName);
				}
			}
		}

		/// <summary>
		/// Maps a .NET type to the corresponding DynamoDB <see cref="ScalarAttributeType"/>.
		/// Supports string, numeric (int, long, float, double), and byte array types.
		/// Throws an <see cref="ArgumentException"/> for unsupported types.
		/// </summary>
		/// <param name="t">The .NET <see cref="Type"/> to map.</param>
		/// <returns>The corresponding <see cref="ScalarAttributeType"/> for DynamoDB.</returns>
		/// <exception cref="ArgumentException">
		/// Thrown if the provided type is not supported for DynamoDB attribute definitions.
		/// </exception>
		private static ScalarAttributeType GetAttributeType(Type t)
		{
			if (t == typeof(string))
			{
				return ScalarAttributeType.S;
			}
			else if (t == typeof(int) || t == typeof(long) || t == typeof(float) || t == typeof(double))
			{
				return ScalarAttributeType.N;
			}
			else if (t == typeof(byte[]))
			{
				return ScalarAttributeType.B;
			}
			else
			{
				throw new ArgumentException($"Unsupported attribute type: {t.Name}");
			}
		}
	}
}
