using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using System.Reflection;

namespace VEXEmcee.DB.Dynamo.Accessors
{
	internal class Common
	{
		private static List<string> _existingTables = [];

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
						for (int i = 0; i < propInfoArr.Length || request.KeySchema.Count == 2; i++)
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
								throw new Exception($"Table {tableAttribute.TableName} creation failed or timed out. Try again later");
							}
						}
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Exception while creating table {tableAttribute.TableName}: {ex.Message}");
					}
				}
				else
				{
					_existingTables.Add(tableAttribute.TableName);
				}
			}
		}

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
