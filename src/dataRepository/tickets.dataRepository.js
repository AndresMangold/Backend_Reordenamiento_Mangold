const TicketDAO = require('../dao/mongo/daoTickets');
const CartsRepository = require('./carts.dataRepository');
const ProductsRepository = require('./products.dataRepository');
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');

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

    async generateTicket(cartId, userEmail) {
        try {
            const cart = await this.#cartsRepository.getCartById(cartId);
            if (!cart) {
                throw CustomError.createError({
                    name: 'Carrito no encontrado',
                    cause: 'Debe ingresar un ID válido existente en la base de datos',
                    message: 'El carrito no existe',
                    code: ErrorCodes.UNDEFINED_CART
                });
            }

            let totalAmount = 0;
            const outOfStockProducts = [];

            for (const item of cart.products) {
                const product = await this.#productsRepository.getProductById(item.product);
                if (product.stock < item.quantity) {
                    outOfStockProducts.push(item.product);
                }
            }

            if (outOfStockProducts.length > 0) {
                throw CustomError.createError({
                    name: 'Error con el stock',
                    cause: `No hay suficiente stock para los productos con ID: ${outOfStockProducts.join(', ')}`,
                    message: 'No se pudo completar la operación por falta de stock',
                    code: ErrorCodes.INSUFFICIENT_STOCK
                });
            }

            for (const item of cart.products) {
                const product = await this.#productsRepository.getProductById(item.product);
                product.stock -= item.quantity;
                totalAmount += product.price * item.quantity;
                await this.#productsRepository.updateProduct(product.id, { stock: product.stock });
            }

            const ticketData = {
                code: this.#generateUniqueCode(),
                amount: totalAmount,
                purchaser: userEmail
            };

            const ticket = await this.#ticketDAO.addTicket(ticketData);
            await this.#cartsRepository.clearCart(cartId);

            return ticket;
        } catch (error) {
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
