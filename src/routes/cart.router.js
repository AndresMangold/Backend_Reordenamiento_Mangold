const { Router } = require('express');
const CartController = require('../controllers/cart.controller');
const { verifyToken } = require('../utils/jwt');
const { isUser } = require('../middlewares/auth.middleware');
const router = Router();
const controller = new CartController();

router.get('/', verifyToken, (req, res) => controller.getCarts(req, res));
router.get('/:cid', verifyToken, (req, res) => controller.getCartById(req, res));
router.post('/', verifyToken, (req, res) => controller.addCart(req, res));
router.post('/:cid/product/:pid', verifyToken, isUser, (req, res) => controller.addProductToCart(req, res));
router.put('/:cid', verifyToken, (req, res) => controller.updateCart(req, res));
router.delete('/:cid/product/:pid', verifyToken, isUser, (req, res) => controller.deleteProductFromCart(req, res));
router.put('/:cid/products/:pid', verifyToken, isUser, (req, res) => controller.updateProductQuantity(req, res));
router.delete('/:cid', verifyToken, isUser, (req, res) => controller.clearCart(req, res));
router.delete('/destroyCart/:cid', verifyToken, isUser, (req, res) => controller.deleteCart(req, res));
router.post('/:cid/purchase', verifyToken, isUser, (req, res) => controller.purchase(req, res));

module.exports = router;
