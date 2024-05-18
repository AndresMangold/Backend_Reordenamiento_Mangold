const ProductManager = require('../dao/dbManagers/productManager');

const productManager = new ProductManager();

module.exports = {
    getProducts: async (req, res) => {
        try {
            const products = await productManager.getProducts(req.query.page, req.query.limit, req.query.sort, req.query.category, req.query.availability);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los productos' });
        }
    },
    // Define other product-related methods here
};
