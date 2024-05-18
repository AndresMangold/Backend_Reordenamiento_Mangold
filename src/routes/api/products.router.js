const { Router } = require('express');
const productController = require('../../controllers/product.controller');

const router = Router();

router.get('/', productController.getProducts);
// Define other product routes here

module.exports = router;
