const { tables } = require('../../jest/jest-dynalite-config')

class FakeOrderDetails {
  constructor ({ orderId, status, value, currencyCode, payeeEmail, givenName, surName, createTime }) {
    this.result = {
      id: orderId,
      status: status,
      purchase_units: [
        { amount: { value: value, currency_code: currencyCode } }
      ],
      payer: {
        email_address: payeeEmail,
        name: {
          given_name: givenName,
          surname: surName
        }
      },
      create_time: createTime
    }
  }
}

function getSeededDynamoOrderDetails () {
  return tables[1].data[0]
}

module.exports = { FakeOrderDetails, getSeededDynamoOrderDetails }
