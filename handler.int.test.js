require('jest-dynalite/withDb')
const payPalSdk = require('./count-libs/paypal-sdk')
const handler = require('./handler')
const { getOrderDetailsDynamoDb } = require('./count-libs/aws-sdk')
const { FakeOrderDetails, getSeededDynamoOrderDetails } = require('./count-libs/test-utils/utils')

jest.mock('./count-libs/paypal-sdk')

test('should increment count and return a success message on a valid new order', async () => {
  const expectedDynamoOrderDetails = {
    order_id: 'handler1-test-order-id',
    amount: '1.00',
    payee_email: 'test@jest.com',
    first_name: 'jest',
    last_name: 'tester',
    create_time: '11/28/2020',
    count: 2
  }
  const fakeOrderDetails = new FakeOrderDetails({
    orderId: expectedDynamoOrderDetails.order_id,
    status: 'COMPLETED', // TODO: put these in constants
    value: expectedDynamoOrderDetails.amount,
    currencyCode: 'USD',
    payeeEmail: expectedDynamoOrderDetails.payee_email,
    givenName: expectedDynamoOrderDetails.first_name,
    surName: expectedDynamoOrderDetails.last_name,
    createTime: expectedDynamoOrderDetails.create_time
  })
  const mockEvent = { body: JSON.stringify({ orderID: fakeOrderDetails.result.id }) }
  payPalSdk.getOrderDetailsPayPal.mockImplementation(() => Promise.resolve(fakeOrderDetails))

  const response = await handler.count(mockEvent)

  // Check that getOrderDetailsPayPal was called with the right arguments
  expect(payPalSdk.getOrderDetailsPayPal).toHaveBeenCalled()
  expect(payPalSdk.getOrderDetailsPayPal).toHaveBeenCalledWith(fakeOrderDetails.result.id)
  // Check that the response is an expected success
  expect(response).toBeDefined()
  expect(response.statusCode).toEqual(200)
  const body = JSON.parse(response.body)
  expect(body).toEqual({ count: 2, isNewCount: true })
  // Check that orderDetails were actually saved in Dynamo
  const savedOrderDetails = await getOrderDetailsDynamoDb(fakeOrderDetails.result.id)
  expect(savedOrderDetails.Item).toEqual(expectedDynamoOrderDetails)
})

test('should return a response with the old count on an old order submitted', async () => {
  const seededEntryOrderId = getSeededDynamoOrderDetails().order_id
  const mockEvent = { body: JSON.stringify({ orderID: seededEntryOrderId }) }

  const response = await handler.count(mockEvent)

  expect(response).toBeDefined()
  expect(response.statusCode).toEqual(200)
  const body = JSON.parse(response.body)
  expect(body).toEqual({ count: 1, isNewCount: false })
})
