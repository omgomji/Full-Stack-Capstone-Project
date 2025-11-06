const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const correlation = require('../utils/correlation');

async function record(req, action, targetType, targetId, snapshot) {
  try {
    await AuditLog.create({
      action: action,
      userId: req.user ? req.user.sub : undefined,
      targetType: targetType,
      targetId: targetId,
      snapshot: snapshot,
      correlationId: correlation.get(req),
      ip: req.ip
    });
  } catch (err) {
    logger.error('Failed to write audit log', { message: err.message });
  }
}

async function list() {
  return AuditLog.find().sort({ createdAt: -1 }).limit(200).lean();
}

module.exports = {
  record: record,
  list: list
};
