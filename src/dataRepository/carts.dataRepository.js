const CartDAO = require('../dao/mongo/daoCarts');
const ProductsRepository = require('./products.dataRepository');
const Cart = require('../models/cart.model'); 

class CartsRepository {
    #cartDAO;
    #productRepository;

    constructor() {
        this.#cartDAO = new CartDAO();
        this.#productRepository = new ProductsRepository();
    }

    async #verifyCartExists(cartId) {
        const cart = await this.#cartDAO.getCartById(cartId);
        if (!cart) {
            throw new Error('Cart does not exist');
        }
    }

    async getCarts() {
        return await this.#cartDAO.getCarts();
    }

    async getCartById(cartId) {
        await this.#verifyCartExists(cartId);
        return await this.#cartDAO.getCartById(cartId);
    }

    async addCart() {
        return await this.#cartDAO.addCart({ products: [] });
    }
    

    async addProductToCart(cartId, productId) {
        await this.#verifyCartExists(cartId);
        const cart = await this.#cartDAO.getCartById(cartId);
        const product = await this.#productRepository.getProductById(productId);

        if (!product) {
            throw new Error('Product does not exist');
        }

        const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, title: product.title, quantity: 1 });
        }
        await this.#cartDAO.updateCart(cartId, { products: cart.products });
        return cart;
    }

    async deleteProductFromCart(cartId, productId) {
        await this.#verifyCartExists(cartId);
        const cart = await this.#cartDAO.getCartById(cartId);
        cart.products = cart.products.filter(p => !p.product.equals(productId));
        await this.#cartDAO.updateCart(cartId, { products: cart.products });
        return cart;
    }

    async updateProductQuantity(cartId, productId, quantity) {
        await this.#verifyCartExists(cartId);
        const cart = await this.#cartDAO.getCartById(cartId);
        const productIndex = cart.products.findIndex(p => p.product.equals(productId));

        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
            await this.#cartDAO.updateCart(cartId, { products: cart.products });
        } else {
            throw new Error('Product not found in cart');
        }
        return cart;
    }

    async clearCart(cartId) {
        await this.#verifyCartExists(cartId);
        await this.#cartDAO.updateCart(cartId, { products: [] });
    }

    async deleteCart(cartId) {
        await this.#verifyCartExists(cartId);
        await this.#cartDAO.deleteCart(cartId);
    }
}

module.exports = CartsRepository;
