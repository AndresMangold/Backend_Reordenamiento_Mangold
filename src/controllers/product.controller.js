const ProductsRepository = require('../dataRepository/products.dataRepository');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { generateProduct } = require('../utils/generateProduct');

class ProductController {
    constructor() {
        this.productRepository = new ProductsRepository();
    }

    async getProducts(req, res) {
        try {
            const { page = 1, limit = 15, sort, category, availability } = req.query;
            const products = await this.productRepository.getProducts(page, limit, sort, category, availability);
            res.render('products', {
                products: {
                    payload: products,
                    page,
                },
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

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ error: 'ID de producto no válido' });
            }

            const product = await this.productRepository.getProductById(productId);
            const productData = product;
            const user = await User.findById(req.user.id).populate('cartId').lean();
    
            res.render('product', {
                product: [productData], 
                cartId: user.cartId ? user.cartId._id : null,
                titlePage: `Productos | ${product.title}`,
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (error) {
            console.log('Error:', error); 
            res.status(500).json({ Error: error.message });
        }
    }
    
    async getMockingProducts(res) {
        try {
            const products = [];
            for (let i = 0; i < 50; i++) {
                products.push(generateProduct());
            }
            res.json(products);
        } catch (error) {
            res.status(500).json({ error });
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
                await this.productRepository.addProduct({ title, description, price, thumbnail, code, stock, category });
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
            await this.productRepository.updateProduct(productId, req.body);
            res.status(200).json({ message: 'Producto actualizado' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.params.pid;
            await this.productRepository.deleteProduct(productId);
            res.status(301).redirect('/api/products');
        } catch (error) {
            res.status(500).json({ Error: error.message });
        }
    }
}

module.exports = ProductController;
