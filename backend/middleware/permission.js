const createHttpError = require('http-errors');
const permissions = require('../config/permissions');
const logger = require('../utils/logger');

var metrics = {
  totalDenials: 0,
  byAction: {}
};

function recordDenial(action, role) {
  metrics.totalDenials += 1;
  if (!metrics.byAction[action]) metrics.byAction[action] = 0;
  metrics.byAction[action] += 1;
  logger.warn('Authorization denied', { action: action, role: role });
}

function can(action, options) {
  var settings = options || {};
  return function (req, res, next) {
    if (!req.user) {
      return next(createHttpError(401, 'Authentication required before permission check'));
    }
    var role = req.user.role;
    if (!role) {
      recordDenial(action, 'unknown');
      return next(createHttpError(403, 'No role associated with user'));
    }
    if (permissions.has(role, action, 'any')) {
      req.permissionScope = 'any';
      return next();
    }
    if (settings.requireOwn !== false && permissions.has(role, action, 'own')) {
      req.permissionScope = 'own';
      return next();
    }
    recordDenial(action, role);
    next(createHttpError(403, 'Forbidden for role ' + role));
  };
}

module.exports = {
  can: can,
  metrics: metrics
};
