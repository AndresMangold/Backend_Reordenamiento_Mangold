const { Router } = require('express');
const router = Router();
const ProductController = require('../controllers/product.controller');
const { verifyToken } = require('../utils/jwt');
const { userIsLoggedIn, userIsAdmin } = require('../middlewares/auth.middleware');

const controller = new ProductController();

router.get('/', userIsLoggedIn, verifyToken, (req, res) => controller.getProducts(req, res));

router.get('/:pid', userIsLoggedIn, verifyToken, (req, res) => controller.getProductById(req, res));

router.post('/:pid', userIsLoggedIn, verifyToken, (req, res) => controller.addProductToCart(req, res));

router.post('/', userIsAdmin, verifyToken, (req, res) => controller.addProduct(req, res));

router.put('/:pid', userIsAdmin, verifyToken, (req, res) => controller.updateProduct(req, res));

router.delete('/:pid', userIsAdmin, verifyToken, (req, res) => controller.deleteProduct(req, res));

module.exports = router;
