const ProductDAO = require('../dao/mongo/daoProducts');
const { productsDTO } = require('../dto/products.dto');

class ProductsRepository {
    constructor() {
        this.daoProducts = new ProductDAO();
    }

    async getProducts(page, limit, sort, category, availability) {
        try {
            const query = {
                ...(category && { category }),
                ...(availability && { status: availability === 'true' })
            };
            const options = {
                limit: parseInt(limit),
                page: parseInt(page),
                sort: sort ? { price: sort } : undefined,
                lean: true,
                select: '-thumbnail'
            };

            const products = await this.daoProducts.getProducts(query, options);
            return products.docs.map(product => new productsDTO(product));
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async addProduct(productData) {
        const productDto = new productsDTO(productData);
        const invalidOptions = isNaN(+productDto.price) || +productDto.price <= 0 || isNaN(+productDto.stock) || +productDto.stock < 0;

        if (!productDto.title || !productDto.description || !productDto.code || !productDto.category || invalidOptions) {
            throw new Error('Error al validar los datos');
        }

        const finalThumbnail = productDto.thumbnail ? productDto.thumbnail : 'Sin Imagen';

        try {
            await this.daoProducts.addProduct({
                ...productDto,
                thumbnail: finalThumbnail
            });

            console.log('Producto agregado correctamente');
        } catch (error) {
            console.error('Error al agregar el producto desde DB:', error);
            throw new Error('Error al agregar el producto desde DB');
        }
    }

    async getProductById(id) {
        try {
            const product = await this.daoProducts.getProductById(id);
            return new productsDTO(product);
        } catch (error) {
            throw new Error('Error al obtener el producto por ID');
        }
    }

    async updateProduct(id, fieldsToUpdate) {
        try {
            await this.daoProducts.updateProduct(id, fieldsToUpdate);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteProduct(id) {
        try {
            await this.daoProducts.deleteProduct(id);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = ProductsRepository;
