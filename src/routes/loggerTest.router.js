const { Router } = require('express');
const router = Router();
const { Controller } = require('../controller/loggerTest.controller');

router.get('/', (req, res) => new Controller().startLogerTest(req, res));

module.exports = router;