const { BadRequestError } = require('./misc')
const { validateOrderDetails } = require('./paypal-sdk')
const { FakeOrderDetails } = require('./test-utils/utils')

test('validateOrderDetails should throw exception on bad OrderDetails', () => {
  const testCases = [
    new FakeOrderDetails({ status: 'foo', value: '1.00', currencyCode: 'USD' }),
    new FakeOrderDetails({ status: 'COMPLETED', value: '2.00', currencyCode: 'USD' }),
    new FakeOrderDetails({ status: 'COMPLETED', value: '1.00', currencyCode: 'foo' }),
    new FakeOrderDetails({ status: 'foo', value: 'foo', currencyCode: 'foo' })
  ]

  testCases.forEach(testCase => {
    expect(() => validateOrderDetails(testCase)).toThrow(BadRequestError)
  })
})

test('validateOrderDetails should not throw an exception on good OrderDetails', () => {
  const testCase = new FakeOrderDetails({ status: 'COMPLETED', value: '1.00', currencyCode: 'USD' })

  validateOrderDetails(testCase)
})
