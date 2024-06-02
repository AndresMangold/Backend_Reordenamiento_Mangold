const CartService = require('../services/cart.service');
const User = require('../models/user.model');

class CartController {
    constructor() {
        this.cartService = new CartService();
    }

    async getCarts(req, res) {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId).lean().populate('cartId');
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }
            const cart = user.cartId;
            if (!cart) {
                return res.status(404).json({ error: 'El usuario no tiene un carrito asociado.' });
            }
            res.status(200).render('cart', {
                cart,
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async getCartById(req, res) {
        try {
            const cartId = req.params.cid;
            const cart = await this.cartService.getCartById(cartId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async addCart(req, res) {
        try {
            const cart = await this.cartService.createCart();
            res.status(200).json({ message: 'Carrito creado con éxito', cart });
        } catch (err) {
            res.status(500).json({ error: 'No se pudo crear el carrito' });
        }
    }

    async addProductToCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const cart = await this.cartService.addProductToCart(cartId, productId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ Error: error.message });
        }
    }

    async deleteProductFromCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            await this.cartService.deleteProductFromCart(cartId, productId);
            console.log(`Producto ${productId} eliminado del carrito ${cartId} de manera correcta.`);

            const cart = await this.cartService.getCartById(cartId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            console.error('Error en la ruta DELETE:', err);
            res.status(500).json({ Error: err.message, stack: err.stack });
        }
    }

    async updateProductQuantityFromCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const { quantity } = req.body;
            await this.cartService.updateProductQuantity(cartId, productId, quantity);
            console.log(`Cantidad del producto ${productId} actualizada en el carrito ${cartId}.`);

            const cart = await this.cartService.getCartById(cartId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async clearCart(req, res) {
        try {
            const cartId = req.params.cid;
            await this.cartService.clearCart(cartId);
            console.log(`Carrito ${cartId} vaciado de manera correcta.`);

            const cart = await this.cartService.getCartById(cartId);
            res.status(200).render('cart', {
                cart: cart.toObject(),
                titlePage: 'Carrito',
                style: ['styles.css'],
                isLoggedIn: req.session.user !== undefined || req.user !== undefined,
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async updateCart(req, res) {
        try {
            const cartId = req.params.cid;
            const { products } = req.body;
            await this.cartService.updateCart(cartId, products);
            res.status(200).json({ message: 'Carrito actualizado correctamente.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deleteCart(req, res) {
        try {
            const cartId = req.params.cid;
            await this.cartService.deleteCart(cartId);
            console.log(`Carrito ${cartId} eliminado de manera correcta.`);
            res.redirect('/api/products'); 
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }
}

module.exports = CartController;
