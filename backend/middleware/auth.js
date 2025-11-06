const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticate(required) {
  return function (req, res, next) {
    var header = req.headers.authorization;
    if (!header) {
      if (required) return next(createHttpError(401, 'Authorization header required'));
      return next();
    }
    var parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      if (required) return next(createHttpError(401, 'Authorization header malformed'));
      return next();
    }
    try {
      var payload = jwt.verify(parts[1], config.auth.jwtSecret);
      req.user = payload;
      req.token = parts[1];
      next();
    } catch (err) {
      if (required) return next(createHttpError(401, 'Invalid or expired token'));
      next();
    }
  };
}

module.exports = {
  required: authenticate(true),
  optional: authenticate(false)
};
