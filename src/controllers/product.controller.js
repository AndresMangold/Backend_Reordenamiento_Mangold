const ProductService = require('../services/product.service');

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
            res.status(200).render('product', {
                product: [productData],
                titlePage: `Productos | ${product.title}`,
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (error) {
            res.status(500).json({ Error: error.message });
        }
    } 

    async addProduct(req, res) {
        try {
            const { title, description, price, thumbnail, code, stock, category } = req.body;
            await this.productService.addProduct(title, description, price, thumbnail, code, stock, category);
            res.status(301).redirect('/api/products');
        } catch (error) {
            res.status(500).json({ Error: error.message });
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
