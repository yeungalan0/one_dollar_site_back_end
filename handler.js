'use strict'

const { getOrderDetailsDynamoDb, saveOrderDetails, incrementCount } = require('./count-libs/aws-sdk')
const { isEmptyObject, successMessage, handleError } = require('./count-libs/misc')
const { getOrderDetailsPayPal, validateOrderDetails } = require('./count-libs/paypal-sdk')

module.exports.count = async event => {
  const orderID = JSON.parse(event.body).orderID
  console.debug(`Processing order_id: ${orderID}`)
  try {
    const previouslySaved = await getOrderDetailsDynamoDb(orderID)
    if (isEmptyObject(previouslySaved)) {
      const orderDetails = await getOrderDetailsPayPal(orderID)
      validateOrderDetails(orderDetails)
      const dynamoObj = await incrementCount()
      await saveOrderDetails(orderDetails, dynamoObj.Attributes.count)
      return successMessage(dynamoObj.Attributes.count, true)
    } else {
      console.debug(`Already processed this order_id. Sending previous count of ${previouslySaved.Item.count}`)
      return successMessage(previouslySaved.Item.count, false)
    }
  } catch (error) {
    return handleError(error)
  }
}
