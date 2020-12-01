'use strict'

require('jest-dynalite/withDb')
const { getOrderDetailsDynamoDb, saveOrderDetails, incrementCount } = require('./aws-sdk')
const { FakeOrderDetails, getSeededDynamoOrderDetails } = require('./test-utils/utils')

test('incrementCount should increment the count', async () => {
  const dynamoObj = await incrementCount()
  expect(dynamoObj.Attributes.count).toStrictEqual(2)
})

test('getOrderDetailsDynamoDb should return expected order details', async () => {
  const expectedOrderDetails = getSeededDynamoOrderDetails()

  const actualOrderDetails = await getOrderDetailsDynamoDb(expectedOrderDetails.order_id)

  expect(actualOrderDetails).toBeDefined()
  expect(actualOrderDetails.Item).toEqual(expectedOrderDetails)
})

test('saveOrderDetails should save the order details', async () => {
  const expectedOrderDetails = {
    order_id: 'test-saveOrderDetails',
    amount: 1.00,
    payee_email: 'test-saveOrderDetails@testing.com',
    first_name: 'jest',
    last_name: 'tester',
    create_time: 'now',
    count: 42
  }
  const fakeOrderDetails = new FakeOrderDetails({
    orderId: expectedOrderDetails.order_id,
    value: expectedOrderDetails.amount,
    payeeEmail: expectedOrderDetails.payee_email,
    givenName: expectedOrderDetails.first_name,
    surName: expectedOrderDetails.last_name,
    createTime: expectedOrderDetails.create_time
  })

  await saveOrderDetails(fakeOrderDetails, 42)

  const actualOrderDetails = await getOrderDetailsDynamoDb(fakeOrderDetails.result.id)
  expect(actualOrderDetails.Item).toEqual(expectedOrderDetails)
})
