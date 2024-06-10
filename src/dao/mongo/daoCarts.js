// src/dao/mongo/daoCarts.js

const Cart = require('../../models/cart.model');

class CartDAO {
    async getCarts() {
        return await Cart.find();
    }

    async getCartById(id) {
        return await Cart.findOne({ _id: id }).populate('products.product');
    }

    async addCart(cart) {
        return await Cart.create(cart);
    }

    async updateCart(id, data) {
        return await Cart.updateOne({ _id: id }, { $set: data });
    }

    async deleteCart(id) {
        return await Cart.deleteOne({ _id: id });
    }
}

module.exports = CartDAO;
