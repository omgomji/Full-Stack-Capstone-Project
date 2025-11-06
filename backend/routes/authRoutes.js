const express = require('express');
const authCtrl = require('../controllers/authController');
const auth = require('../middleware/auth');

var router = express.Router();

router.post('/login', authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', auth.required, authCtrl.logout);
router.get('/me', auth.required, authCtrl.me);

module.exports = router;
