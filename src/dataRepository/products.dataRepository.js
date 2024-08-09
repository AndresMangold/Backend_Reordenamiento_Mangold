const ProductDAO = require('../dao/mongo/daoProducts');
const { productsDTO } = require('../dto/products.dto');
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');
const { generateInvalidProductData } = require('../utils/error/errors');
const logger = require('../utils/logger').logger;

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
            logger.info('Productos obtenidos correctamente.');
            return products.docs.map(product => new productsDTO(product));
        } catch (error) {
            logger.error('Error al obtener los productos.', error);
            throw CustomError.createError({
                name: 'Error fatal',
                cause: 'Ocurrió un error al buscar los productos en la base de datos',
                message: 'Error fatal',
                code: ErrorCodes.DATABASE_ERROR,
                otherProblems: error
            });
        }
    }
    

    async addProduct(productData) {
        const productDto = new productsDTO(productData);
        const invalidOptions = isNaN(+productDto.price) || +productDto.price <= 0 || isNaN(+productDto.stock) || +productDto.stock < 0;

        if (!productDto.title || !productDto.description || !productDto.code || !productDto.category || invalidOptions) {
            logger.warn('Datos inválidos al intentar agregar un producto.', productDto);
            throw CustomError.createError({
                name: 'Error al agregar el producto.',
                cause: generateInvalidProductData(productDto.title, productDto.description, productDto.price, productDto.thumbnail, productDto.code, productDto.status, productDto.stock, productDto.category),
                message: 'Error al agregar el producto.',
                code: ErrorCodes.INVALID_PRODUCT_DATA
            });
        }

        const finalThumbnail = productDto.thumbnail ? productDto.thumbnail : 'Sin Imagen';

        try {
            const product = await this.daoProducts.addProduct({
                ...productDto,
                thumbnail: finalThumbnail
            });
            logger.info('Producto agregado correctamente.');
            return new productsDTO(product);
        } catch (error) {
            logger.error('Error al agregar el producto.', error);
            throw CustomError.createError({
                name: 'Error al agregar el producto',
                cause: 'Hubo un error al agregar el producto en la base de datos',
                message: 'Error al agregar el producto',
                code: ErrorCodes.PRODUCT_CREATION_ERROR,
                otherProblems: error
            });
        }
    }

    async getProductById(id) {
        try {
            const product = await this.daoProducts.getProductById(id);
            logger.info(`Producto con ID ${id} obtenido correctamente.`);
            return new productsDTO(product);
        } catch (error) {
            logger.error(`Error al obtener el producto con ID ${id}.`, error);
            throw CustomError.createError({
                name: 'El producto no existe',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                mensaje: 'El producto no existe',
                code: ErrorCodes.UNDEFINED_PRODUCT,
                otherProblems: error
            });
        }
    }

    async updateProduct(id, fieldsToUpdate) {
        try {
            await this.getProductById(id);

            const areFieldsPresent = Object.keys(fieldsToUpdate).length > 0;
            if (!areFieldsPresent) {
                logger.warn(`No se definieron campos para actualizar el producto con ID ${id}.`);
                throw CustomError.createError({
                    name: 'Campos inválidos',
                    cause: 'Debe definir al menos un campo para actualizar',
                    message: 'Campos inválidos',
                    code: ErrorCodes.PRODUCT_UPDATE_ERROR
                });
            }

            await this.daoProducts.updateProduct(id, fieldsToUpdate);

            const updatedProduct = await this.daoProducts.getProductById(id);
            logger.info(`Producto con ID ${id} actualizado correctamente.`);
            return new productsDTO(updatedProduct);

        } catch (error) {
            logger.error(`Error al actualizar el producto con ID ${id}.`, error);
            throw CustomError.createError({
                name: 'Error al actualizar el producto',
                cause: 'Hubo un error al actualizar el producto en la base de datos',
                message: 'Error al actualizar el producto',
                code: ErrorCodes.PRODUCT_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async deleteProduct(id) {
        try {
            await this.getProductById(id);
            await this.daoProducts.deleteProduct(id);
            logger.info(`Producto con ID ${id} eliminado correctamente.`);
        } catch (error) {
            logger.error(`Error al eliminar el producto con ID ${id}.`, error);
            throw CustomError.createError({
                name: 'Error al eliminar el producto',
                cause: 'Hubo un error al eliminar el producto de la base de datos',
                message: 'Error al eliminar el producto',
                code: ErrorCodes.PRODUCT_DELETION_ERROR,
                otherProblems: error
            });
        }
    }
}

module.exports = ProductsRepository;
