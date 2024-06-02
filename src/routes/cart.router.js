const { Router } = require('express');
const router = Router();
const CartController = require('../controllers/cart.controller');
const { verifyToken } = require('../utils/jwt');
const { userIsLoggedIn } = require('../middlewares/auth.middleware');

const controller = new CartController();

router.get('/', userIsLoggedIn, verifyToken, (req, res) => controller.getCarts(req, res));

router.get('/:cid', userIsLoggedIn, verifyToken, (req, res) => controller.getCartById(req, res));

router.post('/', userIsLoggedIn, verifyToken, (req, res) => controller.addCart(req, res));

router.post('/:cid/product/:pid', userIsLoggedIn, verifyToken, (req, res) => controller.addProductToCart(req, res));

router.put('/:cid', userIsLoggedIn, verifyToken, (req, res) => controller.updateCart(req, res));

router.delete('/:cid/product/:pid', userIsLoggedIn, verifyToken, (req, res) => controller.deleteProductFromCart(req, res));

router.put('/:cid/product/:pid', userIsLoggedIn, verifyToken, (req, res) => controller.updateProductQuantityFromCart(req, res));

router.delete('/:cid', userIsLoggedIn, verifyToken, (req, res) => controller.clearCart(req, res));

router.delete('/destroyCart/:cid', userIsLoggedIn, verifyToken, (req, res) => controller.deleteCart(req, res));

module.exports = router;
