const { BadRequestError } = require('./misc')
const { validateOrderDetails } = require('./paypal-sdk')

test('validateOrderDetails should throw exception on bad OrderDetails', () => {
  const testCases = [
    new FakeOrderDetails('foo', '1.00', 'USD'),
    new FakeOrderDetails('COMPLETED', '2.00', 'USD'),
    new FakeOrderDetails('COMPLETED', '1.00', 'foo'),
    new FakeOrderDetails('foo', 'foo', 'foo')
  ]

  testCases.forEach(testCase => {
    expect(() => validateOrderDetails(testCase)).toThrow(BadRequestError)
  })
})

test('validateOrderDetails should not throw an exception on good OrderDetails', () => {
  const testCase = new FakeOrderDetails('COMPLETED', '1.00', 'USD')

  validateOrderDetails(testCase)
})

class FakeOrderDetails {
  constructor (status, value, currencyCode) {
    this.result = {
      status: null,
      purchase_units: [
        { amount: { value: null, currency_code: null } }
      ]
    }

    this.result.status = status
    this.result.purchase_units[0].amount.value = value
    this.result.purchase_units[0].amount.currency_code = currencyCode
  }
}
