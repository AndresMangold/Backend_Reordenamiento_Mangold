const CartDAO = require('../dao/mongo/daoCarts');
const ProductsRepository = require('./products.dataRepository');
const { CustomError } = require('../utils/error/customErrors');
const Cart = require('../models/cart.model');
const { ErrorCodes } = require('../utils/error/errorCodes');
const logger = require('../utils/logger').logger;

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
            logger.warn(`Carrito con ID ${cartId} no encontrado.`);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El carrito no existe',
                code: ErrorCodes.UNDEFINED_CART
            });
        }
        return cart;
    }

    async #verifyProductExists(productId) {
        try {
            const product = await this.#productRepository.getProductById(productId);
            return product;
        } catch {
            logger.warn(`Producto con ID ${productId} no encontrado.`);
            throw CustomError.createError({
                name: 'Error con los productos',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El producto no existe',
                code: ErrorCodes.UNDEFINED_PRODUCT
            });
        }
    }

    async #verifyAndReduceStock(products) {
        const outOfStockProducts = [];
    
        for (const { product, quantity } of products) {
            const dbProduct = await this.#productRepository.getProductById(product);
            if (dbProduct.stock >= quantity) {
                dbProduct.stock -= quantity;
                await dbProduct.save();
            } else {
                outOfStockProducts.push(product);
            }
        }
    
        return outOfStockProducts;
    }

    async getCarts() {
        try {
            const carts = await this.#cartDAO.getCarts();
            logger.info('Carritos obtenidos correctamente.');
            return carts;
        } catch (error) {
            logger.error('Error al obtener los carritos.', error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Ocurrió un error al buscar los carritos en la base de datos',
                message: 'Error al obtener los carritos',
                code: ErrorCodes.DATABASE_ERROR,
                otherProblems: error
            });
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await this.#verifyCartExists(cartId);
            logger.info(`Carrito con ID ${cartId} obtenido correctamente.`);
            return cart;
        } catch (error) {
            logger.error(`Error al obtener el carrito con ID ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Ocurrió un error al buscar el carrito en la base de datos',
                message: 'Error al obtener el carrito',
                code: ErrorCodes.UNDEFINED_CART,
                otherProblems: error
            });
        }
    }

    async addCart() {
        try {
            const cart = { products: [] };
            const newCart = await this.#cartDAO.addCart(cart);
            logger.info('Carrito creado correctamente.');
            return newCart;
        } catch (error) {
            logger.error('Error al agregar el carrito.', error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al generar un nuevo carrito en la base de datos',
                message: 'Error al agregar el carrito',
                code: ErrorCodes.CART_CREATE_ERROR,
                otherProblems: error
            });
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#verifyProductExists(productId);

            const cart = await this.#cartDAO.getCartById(cartId);

            const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await this.#cartDAO.updateCart(cartId, { products: cart.products });
            logger.info(`Producto ${productId} agregado al carrito ${cartId} correctamente.`);
            return cart;
        } catch (error) {
            logger.error(`Error al agregar el producto ${productId} al carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al agregar el producto al carrito',
                message: 'Error al agregar el producto al carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#verifyProductExists(productId);

            const cart = await this.#cartDAO.getCartById(cartId);
            cart.products = cart.products.filter(p => !p.product.equals(productId));
            const updatedCart = await this.#cartDAO.updateCart(cartId, { products: cart.products });
            logger.info(`Producto ${productId} eliminado del carrito ${cartId} correctamente.`);
            return updatedCart;
        } catch (error) {
            logger.error(`Error al eliminar el producto ${productId} del carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al eliminar el producto del carrito',
                message: 'Error al eliminar el producto del carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#verifyProductExists(productId);

            const cart = await this.#cartDAO.getCartById(cartId);
            const productIndex = cart.products.findIndex(p => p.product.equals(productId));

            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                await this.#cartDAO.updateCart(cartId, { products: cart.products });
                logger.info(`Cantidad del producto ${productId} en el carrito ${cartId} actualizada a ${quantity}.`);
            } else {
                logger.warn(`Producto ${productId} no encontrado en el carrito ${cartId}.`);
                throw CustomError.createError({
                    name: 'Producto no encontrado en el carrito',
                    cause: 'El producto no está presente en el carrito',
                    message: 'Producto no encontrado en el carrito',
                    code: ErrorCodes.PRODUCT_NOT_IN_CART
                });
            }
            return cart;
        } catch (error) {
            logger.error(`Error al actualizar la cantidad del producto ${productId} en el carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al actualizar la cantidad de unidades del producto en el carrito',
                message: 'Error al actualizar el producto en el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async updateCartWithRemainingProducts(cartId, outOfStockProducts) {
        try {
            const cart = await this.#verifyCartExists(cartId);
            const remainingProducts = cart.products.filter(p => !outOfStockProducts.includes(p.product.toString()));
            const updatedCart = await this.#cartDAO.updateCart(cartId, { products: remainingProducts });
            logger.info(`Carrito ${cartId} actualizado con productos restantes.`);
            return updatedCart;
        } catch (error) {
            logger.error(`Error al actualizar el carrito ${cartId} con productos restantes.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al actualizar el carrito con los productos restantes',
                message: 'Error al actualizar el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async clearCart(cartId) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#cartDAO.updateCart(cartId, { products: [] });
            logger.info(`Carrito ${cartId} vaciado correctamente.`);
        } catch (error) {
            logger.error(`Error al vaciar el carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al vaciar el carrito',
                message: 'Error al vaciar el carrito',
                code: ErrorCodes.CART_CLEAR_ERROR,
                otherProblems: error
            });
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await this.#verifyCartExists(cartId);
            cart.products = products;
            const updatedCart = await this.#cartDAO.updateCart(cartId, { products: cart.products });
            return updatedCart;
        } catch (error) {
            logger.error(`Error al actualizar el carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error al actualizar el carrito',
                cause: 'Hubo un problema al actualizar el carrito',
                message: 'Error al actualizar el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#verifyProductExists(productId);

            const cart = await this.#cartDAO.getCartById(cartId);
            const productIndex = cart.products.findIndex(p => p.product.equals(productId));

            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                const updatedCart = await this.#cartDAO.updateCart(cartId, { products: cart.products });
                logger.info(`Cantidad del producto ${productId} en el carrito ${cartId} actualizada a ${quantity}.`);
                return updatedCart;
            } else {
                logger.warn(`Producto ${productId} no encontrado en el carrito ${cartId}.`);
                throw CustomError.createError({
                    name: 'Producto no encontrado en el carrito',
                    cause: 'El producto no está presente en el carrito',
                    message: 'Producto no encontrado en el carrito',
                    code: ErrorCodes.PRODUCT_NOT_IN_CART
                });
            }
        } catch (error) {
            logger.error(`Error al actualizar la cantidad del producto ${productId} en el carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al actualizar la cantidad de unidades del producto en el carrito',
                message: 'Error al actualizar el producto en el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async deleteCart(cartId) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#cartDAO.deleteCart(cartId);
            logger.info(`Carrito ${cartId} eliminado correctamente.`);
        } catch (error) {
            logger.error(`Error al eliminar el carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al eliminar el carrito',
                message: 'Error al eliminar el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }
}

module.exports = CartsRepository;
