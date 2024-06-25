const { Router } = require('express');
const ProductController = require('../controllers/product.controller');
const { verifyToken } = require('../utils/jwt');
const { userIsAdmin, userIsLoggedIn, isUserPremium, isUser, canDeleteProduct } = require('../middlewares/auth.middleware');

const router = Router();
const controller = new ProductController();

router.get('/', userIsLoggedIn, verifyToken, (req, res) => controller.getProducts(req, res));
router.get('/:pid', verifyToken, (req, res) => controller.getProductById(req, res));
router.post('/:pid', verifyToken, isUser, (req, res) => controller.addProductToCart(req, res));
router.post('/', verifyToken, isUserPremium, (req, res) => controller.addProduct(req, res));
router.put('/:pid', verifyToken, userIsAdmin, (req, res) => controller.updateProduct(req, res));
router.delete('/:pid', verifyToken, canDeleteProduct, (req, res) => controller.deleteProduct(req, res));

module.exports = router;
