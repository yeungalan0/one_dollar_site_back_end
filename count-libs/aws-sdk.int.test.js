'use strict'

require('jest-dynalite/withDb')
const { getOrderDetailsDynamoDb, saveOrderDetails, incrementCount } = require('./aws-sdk')

test('incrementCount should increment the count', async () => {
  const dynamoObj = await incrementCount()
  expect(dynamoObj.Attributes.count).toStrictEqual(1)
})

test('getOrderDetailsDynamoDb should return expected order details', async () => {
  const fakeOrderDetails = { result: { id: 'test-123' } }
  const expectedOrderDetails = {
    order_id: 'test-123',
    amount: 1.00,
    payee_email: 'test@test.com',
    full_name: 'awesome tester person',
    create_time: 'today',
    count: 1
  }

  const actualOrderDetails = await getOrderDetailsDynamoDb(fakeOrderDetails)

  expect(actualOrderDetails).toBeDefined()
  expect(actualOrderDetails.Item).toEqual(expectedOrderDetails)
})

test('saveOrderDetails should save the order details', async () => {
  const expectedOrderDetails = {
    order_id: 'test-saveOrderDetails',
    amount: 1.00,
    payee_email: 'test-saveOrderDetails@testing.com',
    full_name: 'jest tester',
    create_time: 'now',
    count: 42
  }
  const fakeOrderDetails = {
    result: {
      id: expectedOrderDetails.order_id,
      purchase_units: [
        { amount: { value: expectedOrderDetails.amount } }
      ],
      payer: {
        email_address: expectedOrderDetails.payee_email,
        given_name: expectedOrderDetails.full_name.split(' ')[0],
        surname: expectedOrderDetails.full_name.split(' ')[1]
      },
      create_time: expectedOrderDetails.create_time
    }
  }

  await saveOrderDetails(fakeOrderDetails, 42)

  const actualOrderDetails = await getOrderDetailsDynamoDb(fakeOrderDetails)
  expect(actualOrderDetails.Item).toEqual(expectedOrderDetails)
})
