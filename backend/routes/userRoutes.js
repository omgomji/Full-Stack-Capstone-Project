const express = require('express');
const auth = require('../middleware/auth');
const permission = require('../middleware/permission');
const userCtrl = require('../controllers/userController');
const permissionsConfig = require('../config/permissions');

var router = express.Router();

router.use(auth.required);

router.get('/roles', function (req, res) {
  res.json({ roles: permissionsConfig.roles });
});

router.get('/', permission.can('users:read'), userCtrl.list);
router.post('/', permission.can('users:create'), userCtrl.create);
router.patch('/:id/role', permission.can('users:assign-role', { requireOwn: false }), userCtrl.updateRole);
router.delete('/:id', permission.can('users:delete'), userCtrl.remove);

module.exports = router;
