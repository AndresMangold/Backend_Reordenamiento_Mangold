// src/routes/createProduct.router.js

const { Router } = require('express');
const ProductController = require('../controllers/product.controller');
const { verifyToken } = require('../utils/jwt');
const { userIsAdmin } = require('../middlewares/auth.middleware');

const router = Router();
const controller = new ProductController();

router.all('/', verifyToken, userIsAdmin, (req, res) => controller.addProduct(req, res));

router.use((err, req, res, next) => {
    if (err.message === 'User is not an admin') {
        res.status(403).send("Debes ser administrador para ingresar aquí");
    } else {
        next(err);
    }
});

module.exports = router;
