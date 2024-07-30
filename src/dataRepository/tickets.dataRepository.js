const TicketDAO = require('../dao/mongo/daoTickets');
const CartsRepository = require('./carts.dataRepository');
const ProductsRepository = require('./products.dataRepository');
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');
const logger = require('../utils/logger').logger;

class TicketRepository {
    #ticketDAO;
    #cartsRepository;
    #productsRepository;

    constructor() {
        this.#ticketDAO = new TicketDAO();
        this.#cartsRepository = new CartsRepository();
        this.#productsRepository = new ProductsRepository();
    }

    #generateUniqueCode() {
        return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    }

    async #verifyAndReduceStock(products) {
        const outOfStockProducts = [];

        for (const { product, quantity } of products) {
            const dbProduct = await this.#productsRepository.getProductById(product);
            if (dbProduct.stock >= quantity) {
                dbProduct.stock -= quantity;
                await this.#productsRepository.updateProduct(dbProduct.id, { stock: dbProduct.stock });
            } else {
                outOfStockProducts.push(product);
            }
        }

        return outOfStockProducts;
    }

    async generateTicket(cartId, userEmail) {
        try {
            const cart = await this.#cartsRepository.getCartById(cartId);
            if (!cart) {
                logger.warn(`Carrito con ID ${cartId} no encontrado.`);
                throw CustomError.createError({
                    name: 'Carrito no encontrado',
                    cause: 'Debe ingresar un ID válido existente en la base de datos',
                    message: 'El carrito no existe',
                    code: ErrorCodes.UNDEFINED_CART
                });
            }

            const outOfStockProducts = await this.#verifyAndReduceStock(cart.products);

            if (outOfStockProducts.length > 0) {
                logger.warn(`No hay suficiente stock para los productos con ID: ${outOfStockProducts.join(', ')}.`);
                return {
                    success: false,
                    outOfStockProducts,
                };
            }

            let totalAmount = 0;
            for (const item of cart.products) {
                const product = await this.#productsRepository.getProductById(item.product);
                totalAmount += product.price * item.quantity;
            }

            const ticketData = {
                code: this.#generateUniqueCode(),
                amount: totalAmount,
                purchaser: userEmail
            };

            const ticket = await this.#ticketDAO.addTicket(ticketData);
            await this.#cartsRepository.clearCart(cartId);
            logger.info(`Ticket generado correctamente para el carrito ${cartId}.`);

            return {
                success: true,
                ticket,
            };
        } catch (error) {
            logger.error(`Error al generar el ticket para el carrito ${cartId}.`, error);
            throw CustomError.createError({
                name: 'Error al generar el ticket',
                cause: 'Ocurrió un error a la hora de generar su ticket de compra',
                message: 'No se pudo generar su ticket',
                code: ErrorCodes.TICKET_CREATION_ERROR,
                otherProblems: error
            });
        }
    }
}

module.exports = TicketRepository;
