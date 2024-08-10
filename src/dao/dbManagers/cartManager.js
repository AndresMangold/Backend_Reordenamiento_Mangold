const { Carts, Products } = require('../');
const Cart = require('../mongo/daoCarts');

class CartManager {

    constructor() { }

    async prepare() {
        if (Carts.db.readyState !== 1) {
            throw new Error('Debes conectarte a mongodb!')
        }
    }

    async verifyCartExists(cartId) {
        try {
    
            const cart = await Carts.findById(cartId);
            if (!cart) {
                throw new Error('El carrito no existe.');
            }
            return cart;
        } catch (error) {
            console.error('Error verificando si el carrito existe:', error); 
            throw new Error('El carrito no existe.');
        }
    }
    

    async verifyProductExists(productId) {
        const product = await Products.findById(productId);
        if (!product) {
            throw new Error('El producto no existe.');
        }
        return product;
    }

    async getCarts() {
        try {
            const carts = await Carts.find();
            return carts;

        } catch {
            throw new Error('Error al importar los carritos');
        }
    }
    
    async addCart() {
        try {
            const newCart = await Carts.create({
                products: []
            })
            return newCart;
        } catch {
            throw new Error('Error al agregar un nuevo carrito.')
        }
    }

    
    async getCartById(cartId) {
    try {
        const cart = await Carts.findById(cartId).populate('products.product');
        
        if (!cart) {
            throw new Error('El carrito no existe');
        }

        cart.products = cart.products.filter(item => item.product !== null);

        return cart;
    } catch (err) {
        throw err;
    }
}
    

    async addProductToCart(productId, cartId) {
        try {
            const product = await this.verifyProductExists(productId);
            console.log('cart id', cartId)
    
            const cart = await this.verifyCartExists(cartId);
    
            const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += 1;
            } else {
                cart.products.push({ product: productId, title: product.title, quantity: 1 });
            }
    
            await cart.save();
    
            console.log('Producto agregado al carrito correctamente');
            return cart;
        } catch (error) {
            console.error('Error en addProductToCart:', error);
            throw new Error('Hubo un error al agregar un producto al carrito.');
        }
    }    

    async deleteProductFromCart(productId, cartId) {
        try {
            const product = await this.verifyProductExists(productId);
            if (!product) {
                throw new Error('El producto no existe.');
            }
            console.log('Producto encontrado:', product);

            const cart = await this.verifyCartExists(cartId);
            if (!cart) {
                throw new Error('El carrito no existe.');
            }
            console.log('Carrito encontrado:', cart);

            const updateResult = await Cart.updateOne(
                { _id: cartId },
                { $pull: { products: { product: productId } } }
            );

            if (updateResult.nModified === 0) {
                throw new Error('No se pudo eliminar el producto del carrito. Verifique que el producto exista en el carrito.');
            }

            console.log(`Se eliminó el producto ${productId} del carrito ${cartId}`);
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            throw new Error('Error al eliminar el producto del carrito');
        }
    }
    

    async updateCart(cartId, products) {
        try {
            const cart = await this.verifyCartExists(cartId);

            for (const { product: productId, quantity } of products) {
                const product = await Products.findById(productId);
                if (!product) {
                    throw new Error(`El producto con ID ${productId} no existe.`);
                }

                const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
                if (existingProductIndex !== -1) {
            
                    cart.products[existingProductIndex].quantity += quantity;
                } else {
                    
                    cart.products.push({ product: productId, quantity });
                }
            }

            await cart.save();

            console.log(`Se actualizó el carrito ${cartId}`);
        } catch (error) {
            console.error('Error al actualizar el carrito:', error);
            throw new Error('Error al actualizar el carrito');
        }
    }

    async updateProductQuantityFromCart(productId, cartId, quantity) {
        try {
            const product = await this.verifyProductExists(productId);
            console.log(product);

            const cart = await this.verifyCartExists(cartId);

            const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity = quantity;

                await cart.save();

                console.log(`Cantidad del producto ${productId} actualizada en el carrito ${cartId}`);
            } else {
                throw new Error('No se pudo encontrar el producto en el carrito');
            }
        } catch (error) {
            console.error('Hubo un error al actualizar la cantidad del producto:', error);
            throw new Error('Hubo un error al actualizar la cantidad del producto.');
        }
    }

    async clearCart(cartId) {
        try {

            const cart = await this.verifyCartExists(cartId);
            console.log(cart);

            await Carts.updateOne({ _id: cartId }, { $set: { products: [] } });

        } catch {
            throw new Error('Hubo un error al vaciar el carrito.')
        }
    }

    async deleteCart(cartId) {
        try {
            const cart = await this.verifyCartExists(cartId);
            console.log(cart);

            await Carts.deleteOne({ _id: cartId });
        } catch {
            throw new Error('Hubo un error al eliminar el carrito.')
        }
    }

};

module.exports = CartManager;