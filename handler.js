'use strict'

// AWS setup
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-west-2' })

if (process.env.IS_LOCAL || process.env.IS_OFFLINE) {
  AWS.config.update({ endpoint: process.env.DYNAMO_ENDPOINT })
}

const docClient = new AWS.DynamoDB.DocumentClient()

const params = {
  TableName: process.env.DYNAMODB_COUNT_TABLE,
  Key: { name: 'test_count' },
  UpdateExpression: 'ADD #c :one',
  ExpressionAttributeValues: { ':one': 1 },
  ExpressionAttributeNames: { '#c': 'count' },
  ReturnValues: 'UPDATED_NEW'
}

// Paypal verification setup
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk')
const payPalClient = require('./payPalClient')

function successMessage (count, isNewCount) {
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(
      {
        count: count,
        isNewCount: isNewCount
      }
    )
  }
}

function errorMessage (error, suggestion = 'Contact us with the error details.') {
  return {
    statusCode: error.statusCode || 500,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      error: error.message,
      suggestion: suggestion
    })
  }
}

async function getOrderDetailsPayPal (orderID) {
  const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID)

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

function handleError (error) {
  if (error instanceof BadRequestError) {
    return errorMessage(error, error.suggestion)
  } else {
    console.error(error)
    return errorMessage(error)
  }
}

// TODO: look to see if order is already in here first
async function saveOrderDetails (orderDetails, count) {
  const orderParams = {
    TableName: process.env.DYNAMODB_ORDERS_TABLE,
    Item: {
      order_id: orderDetails.result.id,
      amount: orderDetails.result.purchase_units[0].amount.value,
      payee_email: orderDetails.result.payer.email_address,
      full_name: `${orderDetails.result.payer.given_name} ${orderDetails.result.payer.surname}`,
      create_time: orderDetails.result.create_time,
      count: count
    }
  }

  await docClient.put(orderParams).promise()
  console.log(`Successfully saved order details: ${orderDetails.result.id}`)
}

async function getOrderDetailsDynamodDb (orderDetails) {
  const orderParams = {
    TableName: process.env.DYNAMODB_ORDERS_TABLE,
    Key: { order_id: orderDetails.result.id }
  }

  return docClient.get(orderParams).promise()
}

function isEmptyObject (obj) {
  return !Object.keys(obj).length
}

// TODO: Move a bunch of the above into it's own functions

module.exports.count = async event => {
  const orderID = JSON.parse(event.body).orderID
  console.debug(`Processing order_id: ${orderID}`)

  try {
    const orderDetails = await getOrderDetailsPayPal(orderID)
    validateOrderDetails(orderDetails)
    const previouslySaved = await getOrderDetailsDynamodDb(orderDetails)
    if (isEmptyObject(previouslySaved)) {
      const dynamoObj = await docClient.update(params).promise()
      saveOrderDetails(orderDetails, dynamoObj.Attributes.count)
      return successMessage(dynamoObj.Attributes.count, true)
    } else {
      console.debug(`Already processed this order_id. Sending previous count of ${previouslySaved.count}`)
      return successMessage(previouslySaved.Item.count, false)
    }
  } catch (error) {
    return handleError(error)
  }
}

class BadRequestError extends Error {
  constructor (message, suggestion, statusCode = 400) {
    super(message)
    this.name = 'BadRequestError'
    this.suggestion = suggestion
    this.statusCode = statusCode
  }
}
