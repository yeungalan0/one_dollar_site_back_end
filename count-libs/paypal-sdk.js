'use strict'

const { BadRequestError } = require('./misc')

// Paypal verification setup
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk')
const payPalClient = require('./payPalClient')

async function getOrderDetailsPayPal (orderId) {
  const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId)

  return payPalClient.client().execute(request)
}

function validateOrderDetails (orderDetails) {
  if (orderDetails.result.status !== 'COMPLETED') {
    throw new BadRequestError(
      `Order verification failed, status of '${orderDetails.result.status}' is not 'COMPLETED'!`,
      'Check your transaction details and try again.',
      400
    )
  } else if (orderDetails.result.purchase_units[0].amount.value !== '1.00') {
    throw new BadRequestError(
      'Order verification failed, amount of ' +
      `'${orderDetails.result.purchase_units[0].amount.value}' is not '1.00'!`,
      'Check your transaction details and try again.',
      400
    )
  } else if (orderDetails.result.purchase_units[0].amount.currency_code !== 'USD') {
    throw new BadRequestError(
      'Order verification failed, currency of ' +
      `'${orderDetails.result.purchase_units[0].amount.currency_code}' is not 'USD'!`,
      'Check your transaction details and try again.',
      400
    )
  }
}

module.exports = { getOrderDetailsPayPal, validateOrderDetails }
