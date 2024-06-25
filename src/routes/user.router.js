const { Router } = require('express');
const { Controller } = require('../controllers/session.controller');
const { verifyToken } = require('../utils/jwt');

const router = Router();
const controller = new Controller();

router.post('/premium/:uid', verifyToken, (req, res) => {
    controller.changeRole(req, res);
});

module.exports = router;
