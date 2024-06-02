const daoProducts = require('../dao/mongo/daoProducts');

class ProductService {
    constructor() {
        this.daoProducts = new daoProducts();
    }

    async getProducts(page, limit, sort, category, availability) {
        try {
            return await this.daoProducts.getProducts(page, limit, sort, category, availability);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getProductById(id) {
        try {
            await this.daoProducts.prepare();
            return await this.daoProducts.getProductById(id);
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    async addProduct(title, description, price, thumbnail, code, stock, category) {
        try {
            await this.daoProducts.prepare();
            await this.daoProducts.addProduct(title, description, price, thumbnail, code, stock, category);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateProduct(id, fieldsToUpdate) {
        try {
            await this.daoProducts.prepare();
            await this.daoProducts.updateProduct(id, fieldsToUpdate);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteProduct(id) {
        try {
            await this.daoProducts.prepare();
            await this.daoProducts.deleteProduct(id);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = ProductService;
