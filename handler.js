'use strict'

const { getOrderDetailsDynamodDb, saveOrderDetails, incrementCount } = require('./count-libs/aws-sdk')
const { isEmptyObject, successMessage, handleError } = require('./count-libs/misc')
const { getOrderDetailsPayPal, validateOrderDetails } = require('./count-libs/paypal-sdk')

module.exports.count = async event => {
  const orderID = JSON.parse(event.body).orderID
  console.debug(`Processing order_id: ${orderID}`)

  try {
    const orderDetails = await getOrderDetailsPayPal(orderID)
    validateOrderDetails(orderDetails)
    const previouslySaved = await getOrderDetailsDynamodDb(orderDetails)
    if (isEmptyObject(previouslySaved)) {
      const dynamoObj = await incrementCount()
      saveOrderDetails(orderDetails, dynamoObj.Attributes.count)
      return successMessage(dynamoObj.Attributes.count, true)
    } else {
      console.debug(`Already processed this order_id. Sending previous count of ${previouslySaved.Item.count}`)
      return successMessage(previouslySaved.Item.count, false)
    }
  } catch (error) {
    return handleError(error)
  }
}
