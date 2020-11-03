'use strict'

// AWS setup
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-west-2' })

if (process.env.IS_LOCAL || process.env.IS_OFFLINE) {
  AWS.config.update({ endpoint: process.env.LOCAL_DYNAMO_ENDPOINT })
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

async function incrementCount () {
  return docClient.update(params).promise()
}

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

module.exports = { incrementCount, saveOrderDetails, getOrderDetailsDynamodDb }
