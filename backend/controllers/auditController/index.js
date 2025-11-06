const auditService = require('../../services/auditService');

async function list(req, res, next) {
  try {
    var logs = await auditService.list();
    res.json({ logs: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: list
};
