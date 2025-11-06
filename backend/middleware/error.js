const logger = require('../utils/logger');
const correlation = require('../utils/correlation');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  var status = err.status || err.statusCode || 500;
  var payload = {
    message: err.expose ? err.message : 'Unexpected error',
    correlationId: correlation.get(req)
  };
  if (err.code === 'EBADCSRFTOKEN') {
    status = 403;
    payload.message = 'Invalid CSRF token';
  }
  logger.error(err.message, {
    status: status,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    correlationId: payload.correlationId
  });
  res.status(status).json(payload);
}

module.exports = errorHandler;
