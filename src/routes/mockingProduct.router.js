const { Router } = require('express');
const router = Router();
const ProductController = require('../controllers/product.controller'); 

router.get('/', (req, res) => {
    const controller = new ProductController();
    controller.getMockingProducts(res);
});

module.exports = router;
