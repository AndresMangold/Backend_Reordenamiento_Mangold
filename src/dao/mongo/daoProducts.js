// src/dao/mongo/daoProducts.js

const Product = require('../../models/product.model');

class ProductDAO {
    async getProducts(query, options) {
        return await Product.paginate(query, options);
    }

    async getProductById(id) {
        return await Product.findById(id);
    }

    async addProduct(product) {
        return await Product.create(product);
    }

    async updateProduct(id, product) {
        return await Product.updateOne({ _id: id }, { $set: product });
    }

    async deleteProduct(id) {
        return await Product.deleteOne({ _id: id });
    }
}

module.exports = ProductDAO;
