const express = require('express');
const auth = require('../middleware/auth');
const permission = require('../middleware/permission');
const auditCtrl = require('../controllers/auditController');

var router = express.Router();

router.use(auth.required);
router.get('/', permission.can('audit:read', { requireOwn: false }), auditCtrl.list);
router.get('/metrics', permission.can('audit:read', { requireOwn: false }), function (req, res) {
	res.json({ authorizationDenials: permission.metrics });
});

module.exports = router;
