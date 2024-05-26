const { Router } = require('express');
const router = Router();
const CartController = require('../controllers/cart.controller');
const { userIsLoggedIn } = require('../middlewares/auth.middleware');
const daoCarts = require('../dao/mongo/daoCarts');
const User = require('../models/user.model')

const controller = new CartController();

router.get('/', userIsLoggedIn, (req, res) => controller.getCarts(req, res));

router.get('/:cid', userIsLoggedIn, (req, res) => controller.getCartById(req, res));

router.post('/', userIsLoggedIn, (req, res) => controller.addCart(req, res));

router.post('/:cid/product/:pid', userIsLoggedIn, (req, res) => controller.addProductToCart(req, res));

router.put('/:cid', userIsLoggedIn, (req, res) => controller.updateCart(req, res));

router.delete('/:cid/product/:pid', userIsLoggedIn, (req, res) => controller.deleteProductFromCart(req, res));

router.put('/:cid/product/:pid', userIsLoggedIn, (req, res) => controller.updateProductQuantityFromCart(req, res));

router.delete('/:cid', userIsLoggedIn, (req, res) => controller.clearCart(req, res));

router.delete('/destroyCart/:cid', userIsLoggedIn, (req, res) => controller.deleteCart(req, res));

module.exports = router;
