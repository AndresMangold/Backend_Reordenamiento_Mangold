// src/dataRepository/tickets.dataRepository.js

const TicketDAO = require('../dao/mongo/daoTickets');
const CartsRepository = require('./carts.dataRepository');
const ProductsRepository = require('./products.dataRepository');

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
        const cart = await this.#cartsRepository.getCartById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        let totalAmount = 0;

        for (const item of cart.products) {
            const product = await this.#productsRepository.getProductById(item.product);
            if (product.stock < item.quantity) {
                throw new Error(`No hay suficiente stock para el producto con ID ${product.id}`);
            }
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
    }
}

module.exports = TicketRepository;
