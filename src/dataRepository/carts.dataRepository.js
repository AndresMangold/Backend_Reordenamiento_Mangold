const CartDAO = require('../dao/mongo/daoCarts');
const ProductsRepository = require('./products.dataRepository');
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');

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
            throw CustomError.createError({
                name: 'Error con los productos',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El producto no existe',
                code: ErrorCodes.UNDEFINED_PRODUCT
            });
        }
    }

    async getCarts() {
        try {
            return await this.#cartDAO.getCarts();
        } catch (error) {
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
            return cart;
        } catch (error) {
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
            return await this.#cartDAO.addCart(cart);
        } catch (error) {
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
            return cart;
        } catch (error) {
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
            await this.#cartDAO.updateCart(cartId, { products: cart.products });
            return cart;
        } catch (error) {
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
            } else {
                throw CustomError.createError({
                    name: 'Producto no encontrado en el carrito',
                    cause: 'El producto no está presente en el carrito',
                    message: 'Producto no encontrado en el carrito',
                    code: ErrorCodes.PRODUCT_NOT_IN_CART
                });
            }
            return cart;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al actualizar la cantidad de unidades del producto en el carrito',
                message: 'Error al actualizar el producto en el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async clearCart(cartId) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#cartDAO.updateCart(cartId, { products: [] });
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al vaciar el carrito',
                message: 'Error al vaciar el carrito',
                code: ErrorCodes.CART_CLEAR_ERROR,
                otherProblems: error
            });
        }
    }

    async updateCartWithRemainingProducts(cartId, outOfStockProducts) {
        try {
            await this.#verifyCartExists(cartId);
            const cart = await this.#cartDAO.getCartById(cartId);
            const remainingProducts = cart.products.filter(p => !outOfStockProducts.includes(p.product.toString()));
            await this.#cartDAO.updateCart(cartId, { products: remainingProducts });
        } catch (error) {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Hubo un problema al actualizar el carrito con los productos restantes',
                message: 'Error al actualizar el carrito',
                code: ErrorCodes.CART_UPDATE_ERROR,
                otherProblems: error
            });
        }
    }

    async deleteCart(cartId) {
        try {
            await this.#verifyCartExists(cartId);
            await this.#cartDAO.deleteCart(cartId);
        } catch (error) {
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
