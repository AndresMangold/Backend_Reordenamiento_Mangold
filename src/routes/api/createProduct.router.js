const { Router } = require('express');
const router = Router();
const { userIsAdmin } = require('../middlewares/auth.middleware');

router.get('/', userIsAdmin, async (_, res) => {
    res.render('createProduct', {
        titlePage: 'Agregar Producto',
        style: ['styles.css'],
        script: ['createProduct.js']
    });
});

router.post('/', userIsAdmin, async (req, res) => {
    try {
        const { title, description, price, thumbnail, code, status, stock } = req.body;
        const productManager = req.app.get('productManager');
        await productManager.addProduct(title, description, price, thumbnail, code, status, stock);
        res.status(301).redirect('/api/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

router.use((err, req, res, next) => {
    if (err.message === 'User is not an admin') {
        res.status(403).send("Debes ser administrador para ingresar aquí");
    } else {
        next(err);
    }
});

module.exports = router;
