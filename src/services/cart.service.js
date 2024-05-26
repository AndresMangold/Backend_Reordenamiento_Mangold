const daoCarts = require('../dao/mongo/daoCarts');

class CartService {
    constructor() {
        this.daoCarts = new daoCarts();
    }

    async getAllCarts() {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.getCarts();
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async getCartById(cartId) {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.getCartById(cartId);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async createCart() {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.addCart();
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.addProductToCart(productId, cartId);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async updateCart(cartId, products) {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.updateCart(cartId, products);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.deleteProductFromCart(productId, cartId);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.updateProductQuantityFromCart(productId, cartId, quantity);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async clearCart(cartId) {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.clearCart(cartId);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async deleteCart(cartId) {
        try {
            await this.daoCarts.prepare();
            return await this.daoCarts.deleteCart(cartId);
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = CartService;
