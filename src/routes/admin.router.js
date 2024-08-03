const { Router } = require('express');
const { userIsAdmin } = require('../middlewares/auth.middleware');
const { Controller } = require('../controllers/session.controller');

const router = Router();
const controller = new Controller();

router.get('/', userIsAdmin, (req, res) => {
    controller.getAllUsers(req, res);
});

module.exports = router;
