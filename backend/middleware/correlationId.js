const { v4: uuid } = require('uuid');
const correlation = require('../utils/correlation');

function correlationId() {
  return function (req, res, next) {
    var incoming = req.headers[correlation.header];
    var id = typeof incoming === 'string' && incoming.trim() !== '' ? incoming : uuid();
    correlation.set(req, id);
    res.setHeader(correlation.header, id);
    next();
  };
}

module.exports = correlationId;
