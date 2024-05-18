const CartManager = require('../dao/dbManagers/cartManager');

const cartManager = new CartManager();

module.exports = {
    getCarts: async (req, res) => {
        try {
            const carts = await cartManager.getCarts();
            res.json(carts);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los carritos' });
        }
    },
    // Define other cart-related methods here
};
