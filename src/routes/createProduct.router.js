const { Router } = require('express');
const ProductController = require('../controllers/product.controller');
const { verifyToken } = require('../utils/jwt');
const { userIsAdmin, isUserPremium } = require('../middlewares/auth.middleware');

const router = Router();
const controller = new ProductController();

router.all('/', verifyToken, (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'premium') {
        return next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Necesitas ser admin o usuario premium' });
    }
}, (req, res) => controller.addProduct(req, res));

router.use((err, req, res, next) => {
    if (err.message === 'User is not an admin') {
        res.status(403).send("Debes ser administrador para ingresar aquí");
    } else {
        next(err);
    }
});

module.exports = router;
