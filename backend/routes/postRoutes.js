const express = require('express');
const auth = require('../middleware/auth');
const permission = require('../middleware/permission');
const postCtrl = require('../controllers/postController');

var router = express.Router();

router.use(auth.required);

router.get('/', permission.can('posts:read', { requireOwn: false }), postCtrl.list);
router.get('/:id', permission.can('posts:read', { requireOwn: false }), postCtrl.getById);
router.post('/', permission.can('posts:create'), postCtrl.create);
router.put('/:id', permission.can('posts:update'), postCtrl.update);
router.delete('/:id', permission.can('posts:delete'), postCtrl.remove);

module.exports = router;
