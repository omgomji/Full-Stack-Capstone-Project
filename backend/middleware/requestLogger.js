const logger = require('../utils/logger');
const correlation = require('../utils/correlation');

function requestLogger() {
  return function (req, res, next) {
    var start = Date.now();
    res.on('finish', function () {
      var duration = Date.now() - start;
      logger.info(req.method + ' ' + req.originalUrl, {
        status: res.statusCode,
        durationMs: duration,
        correlationId: correlation.get(req),
        userId: req.user ? req.user.sub : undefined,
        role: req.user ? req.user.role : undefined
      });
    });
    next();
  };
}

module.exports = requestLogger;
