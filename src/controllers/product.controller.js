const ProductService = require('../services/product.service');
const User = require('../models/user.model');

class ProductController {
    constructor() {
        this.productService = new ProductService();
    }

    async getProducts(req, res) {
        try {
            const { page = 1, limit = 10, sort, category, availability } = req.query;
            const products = await this.productService.getProducts(page, limit, sort, category, availability);
            res.render('products', {
                products,
                titlePage: 'Productos',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const productId = req.params.pid;
            const product = await this.productService.getProductById(productId);
            const productData = product.toObject();
            const user = await User.findById(req.user._id).populate('cartId').lean();

            res.status(200).render('product', {
                product: [productData],
                cartId: user.cartId ? user.cartId._id : null,
                titlePage: `Productos | ${product.title}`,
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (error) {
            res.status(500).json({ Error: error.message });
        }
    } 

    async addProduct(req, res) {
        if (req.method === 'GET') {
            return res.render('createProduct', {
                titlePage: 'Agregar Producto',
                style: ['styles.css'],
                script: ['createProduct.js']
            });
        }

        if (req.method === 'POST') {
            try {
                const { title, description, price, thumbnail, code, stock, category } = req.body;

                console.log('Datos recibidos:', { title, description, price, thumbnail, code, stock, category });

                await this.productService.addProduct(title, description, price, thumbnail, code, stock, category);
                res.status(301).redirect('/api/products');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error interno del servidor');
            }
        }
    }


    async updateProduct(req, res) {
        try {
            const productId = req.params.pid;
            await this.productService.updateProduct(productId, req.body);
            res.status(200).json({ message: 'Producto actualizado' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.params.pid;
            await this.productService.deleteProduct(productId);
            res.status(301).redirect('/api/products');
        } catch (error) {
            res.status(500).json({ Error: error.message });
        }
    }
}

module.exports = ProductController;
