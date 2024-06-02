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


    async addProduct(title, description, price, thumbnail, code, stock, category) {
        const invalidOptions = isNaN(+price) || +price <= 0 || isNaN(+stock) || +stock < 0;

        if (!title || !description || !code || !category || invalidOptions) {
            throw new Error('Error al validar los datos');
        }

        const finalThumbnail = thumbnail ? thumbnail : 'Sin Imagen';

        try {
            await this.daoProducts.addProduct({
                title,
                description,
                price,
                thumbnail: finalThumbnail,
                code,
                stock,
                category
            });

            console.log('Producto agregado correctamente');
        } catch (error) {
            console.error('Error al agregar el producto desde DB:', error);
            throw new Error('Error al agregar el producto desde DB');
        }
    }

    async getProductById(id) {
        try {
            const product = await this.Product.findById(id);
            return product;
        } catch (error) {
            throw new Error('Error al obtener el producto por ID');
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
