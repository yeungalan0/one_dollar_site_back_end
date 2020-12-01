module.exports = {
  tables: [
    {
      TableName: process.env.DYNAMODB_COUNT_TABLE,
      KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'name', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      data: [
        {
          name: 'counter',
          count: 1
        }
      ]
    },
    {
      TableName: process.env.DYNAMODB_ORDERS_TABLE,
      KeySchema: [{ AttributeName: 'order_id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'order_id', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      data: [
        {
          order_id: 'test-123',
          amount: 1.00,
          payee_email: 'test@test.com',
          first_name: 'awesome',
          last_name: 'tester',
          create_time: 'today',
          count: 1
        }
      ]
    }
  ],
  basePort: 8000
}
