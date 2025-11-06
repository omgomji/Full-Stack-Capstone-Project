var HEADER = 'x-correlation-id';

module.exports = {
  header: HEADER,
  get: function (req) {
    if (!req) return undefined;
    return req.correlationId || req.headers[HEADER];
  },
  set: function (req, id) {
    if (req) req.correlationId = id;
  }
};
