const { Router } = require('express');
const cartController = require('../../controllers/cart.controller');

const router = Router();

router.get('/', cartController.getCarts);
// Define other cart routes here

module.exports = router;
