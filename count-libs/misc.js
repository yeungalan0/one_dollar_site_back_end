'use strict'

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

function handleError (error) {
  if (error instanceof BadRequestError) {
    return errorMessage(error, error.suggestion)
  } else {
    console.error(error)
    return errorMessage(error)
  }
}

function isEmptyObject (obj) {
  return !Object.keys(obj).length
}

class BadRequestError extends Error {
  constructor (message, suggestion, statusCode = 400) {
    super(message)
    this.name = 'BadRequestError'
    this.suggestion = suggestion
    this.statusCode = statusCode
  }
}

module.exports = { BadRequestError, successMessage, errorMessage, handleError, isEmptyObject }
