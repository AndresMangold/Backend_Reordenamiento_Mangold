const CartsRepository = require('../dataRepository/carts.dataRepository');
const TicketRepository = require('../dataRepository/tickets.dataRepository');
const User = require('../models/user.model');
const Product = require('../models/product.model');


class CartController {
    constructor() {
        this.cartsRepository = new CartsRepository();
        this.ticketRepository = new TicketRepository();
    }

    async getCarts(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).lean().populate('cartId');
            if (!user) {
                req.logger.warn('Usuario no encontrado.');
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }
            const cart = user.cartId;
            if (!cart) {
                req.logger.warn('El usuario no tiene un carrito asociado.');
                return res.status(404).json({ error: 'El usuario no tiene un carrito asociado.' });
            }
            res.status(200).render('cart', {
                cart,
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ Error: err.message });
        }
    }

    async getCartById(req, res) {
        try {
            const cartId = req.params.cid;
            const cart = await this.cartsRepository.getCartById(cartId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ Error: err.message });
        }
    }

    async addCart(req, res) {
        try {
            const cart = await this.cartsRepository.addCart();
            req.logger.info('Carrito creado con éxito.');
            res.status(200).json({ message: 'Carrito creado con éxito', cart });
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ error: 'No se pudo crear el carrito' });
        }
    }

    async addProductToCart(req, res) {
        const cartId = req.params.cid; 
        const productId = req.params.pid;
        const user = req.user; 

        try {
            const product = await Product.findById(productId).populate('owner');
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            const productOwner = product.owner;
            if (productOwner && productOwner.role === 'premium' && productOwner._id.equals(user.id)) {
                return res.status(403).json({ error: 'No puedes añadir tu propio producto premium' });
            }

            const cart = await this.cartsRepository.addProductToCart(cartId, productId, user.id);
            req.logger.info(`Producto ${productId} agregado al carrito ${cartId} de manera correcta.`);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (error) {
            req.logger.error(`Error al agregar el producto ${productId} al carrito ${cartId}.`, error);
            res.status(500).json({ error: 'Error al agregar el producto al carrito' });
        }
    }
    

    async deleteProductFromCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            await this.cartsRepository.deleteProductFromCart(cartId, productId);
            req.logger.info(`Producto ${productId} eliminado del carrito ${cartId} de manera correcta.`);

            const cart = await this.cartsRepository.getCartById(cartId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            req.logger.error('Error en la ruta DELETE:', err);
            res.status(500).json({ Error: err.message, stack: err.stack });
        }
    }

    async updateProductQuantity(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const { quantity } = req.body;
            const updatedCart = await this.cartsRepository.updateProductQuantity(cartId, productId, quantity);
            req.logger.info(`Cantidad del producto ${productId} en el carrito ${cartId} actualizada a ${quantity}.`);
            res.status(200).json({ message: 'Cantidad del producto actualizada correctamente.', cart: updatedCart });
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ error: err.message });
        }
    }

    async clearCart(req, res) {
        try {
            const cartId = req.params.cid;
            await this.cartsRepository.clearCart(cartId);
            req.logger.info(`Carrito ${cartId} vaciado de manera correcta.`);

            const cart = await this.cartsRepository.getCartById(cartId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ Error: err.message });
        }
    }

    async updateCart(req, res) {
        try {
            const cartId = req.params.cid;
            const { products } = req.body;
            const updatedCart = await this.cartsRepository.updateCart(cartId, products);
            req.logger.info(`Carrito ${cartId} actualizado correctamente.`);
            res.status(200).json({ message: 'Carrito actualizado correctamente.', cart: updatedCart });
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ error: err.message });
        }
    }

    async deleteCart(req, res) {
        try {
            const cartId = req.params.cid;
            await this.cartsRepository.deleteCart(cartId);
            req.logger.info(`Carrito ${cartId} eliminado de manera correcta.`);
            res.redirect('/api/products');
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ Error: err.message });
        }
    }

    async purchase(req, res) {
        const { cid } = req.params;
        const { user } = req;
    
        try {
            const result = await this.ticketRepository.generateTicket(cid, user.email);
            if (result.success) {
                req.logger.info('Compra realizada con éxito.');
                res.render('purchaseSuccess', { ticket: result.ticket });
            } else {
                await this.cartsRepository.updateCartWithRemainingProducts(cid, result.outOfStockProducts);
                req.logger.warn('Algunos productos no pudieron ser comprados por falta de stock.');
                res.status(400).render('purchaseError', {
                    message: 'Algunos productos no pudieron ser comprados por falta de stock',
                    cart: { _id: cid }
                });
            }
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(500).render('purchaseError', { message: error.message, cart: { _id: cid } });
        }
    }       
}

module.exports = CartController;
