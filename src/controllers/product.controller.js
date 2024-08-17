const ProductsRepository = require('../dataRepository/products.dataRepository');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { generateProduct } = require('../utils/generateProduct');
const MailingService = require('../utils/mailingService');

class ProductController {
    constructor() {
        this.productRepository = new ProductsRepository();
        this.mailingService = new MailingService();
    }

    async getProducts(req, res) {
        try {
            const { page = 1, limit = 15, sort, category, availability } = req.query;
            const products = await this.productRepository.getProducts(page, limit, sort, category, availability);
            req.logger.info('Productos obtenidos correctamente.');
            res.render('products', {
                products: {
                    payload: products,
                    page,
                },
                titlePage: 'Productos',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
                isAdmin: req.user && req.user.role === 'admin',
            });
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(500).json({ error: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const productId = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                req.logger.warn('ID de producto no válido');
                return res.status(400).json({ error: 'ID de producto no válido' });
            }

            const product = await this.productRepository.getProductById(productId);
            const productData = product;
            const user = await User.findById(req.user.id).populate('cartId').lean();

            req.logger.info(`Producto ${productId} obtenido correctamente.`);
            res.render('product', {
                product: [productData],
                cartId: user.cartId ? user.cartId._id : null,
                titlePage: `Productos | ${product.title}`,
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(500).json({ Error: error.message });
        }
    }

    async getMockingProducts(req, res) {
        try {
            const products = [];
            for (let i = 0; i < 50; i++) {
                products.push(generateProduct());
            }
            req.logger.info('Productos de prueba generados correctamente.');
            res.json(products);
        } catch (error) {
            req.logger.error(error.message, error);
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
                const { title, description, price, code, stock, category } = req.body;
                const owner = req.user.role === 'admin' ? undefined : req.user.id; 
                const thumbnail = req.file ? req.file.filename : 'Sin Imagen';
    
                const productData = { title, description, price, thumbnail, code, stock, category };
                if (owner) {
                    productData.owner = owner; 
                }
    
                await this.productRepository.addProduct(productData);
                req.logger.info('Producto agregado con éxito.');
                res.status(301).redirect('/api/products');
            } catch (error) {
                req.logger.error('Error al agregar el producto:', error);
                res.status(500).send('Error interno del servidor');
            }
        }
    }

    async updateProduct(req, res) {
        try {
            const productId = req.params.pid;
            await this.productRepository.updateProduct(productId, req.body);
            req.logger.info(`Producto ${productId} actualizado correctamente.`);
            res.status(200).json({ message: 'Producto actualizado' });
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.params.pid;
            const product = await this.productRepository.getProductById(productId);
    
            if (!product) {
                req.logger.warn('Producto no encontrado');
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
    
            if (!req.user) {
                req.logger.error('Usuario no autenticado');
                return res.status(401).json({ error: 'Debe estar autenticado para realizar esta acción' });
            }

            if (req.user.role === 'admin') {
                await this.productRepository.deleteProduct(productId);
                req.logger.info(`Producto ${productId} eliminado correctamente por el administrador.`);
                return res.status(301).redirect('/api/products');
            }

            if (product.owner) {
                const productOwner = await User.findById(product.owner);
    
                if (!productOwner) {
                    req.logger.warn('Propietario del producto no encontrado');
                    return res.status(404).json({ error: 'Propietario del producto no encontrado' });
                }
    
                if (productOwner._id.equals(req.user.id)) {
                    await this.productRepository.deleteProduct(productId);
                    req.logger.info(`Producto ${productId} eliminado correctamente por el propietario.`);

                    if (productOwner.role === 'premium') {
                        await this.mailingService.sendMail({
                            to: productOwner.email,
                            subject: 'Tu producto ha sido eliminado',
                            html: `<p>Hola ${productOwner.firstName},</p>
                                   <p>Tu producto "${product.title}" ha sido eliminado.</p>`
                        });
                        req.logger.info(`Correo enviado al propietario premium del producto ${productId}.`);
                    }
    
                    return res.status(301).redirect('/api/products');
                }
            }

            req.logger.warn('Usuario no autorizado para eliminar este producto');
            res.status(403).json({ error: 'No tiene permisos para eliminar este producto' });
    
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(500).json({ Error: error.message });
        }
    }
    
}

module.exports = ProductController;
