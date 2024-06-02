const mongoose = require('mongoose');
const Cart = require('../../models/cart.model'); 
const Product = require('../../models/product.model'); 

class daoCarts {
    constructor() {
        this.Cart = Cart;
        this.Product = Product;
    }

    async prepare() {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Debe estar conectado a MongoDB');
        }
    }

    async verifyCartExists(cartId) {
        try {
            await this.prepare();
            const cart = await this.Cart.findById(cartId);
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
        try {
            await this.prepare();
            const product = await this.Product.findById(productId);
            if (!product) {
                throw new Error('El producto no existe.');
            }
            return product;
        } catch (error) {
            console.error('Error verificando si el producto existe:', error);
            throw new Error('El producto no existe.');
        }
    }

    async getCarts() {
        try {
            await this.prepare();
            const carts = await this.Cart.find();
            return carts;
        } catch (error) {
            throw new Error('Error al importar los carritos');
        }
    }

    async addCart() {
        try {
            await this.prepare();
            const newCart = await this.Cart.create({
                products: []
            });
            return newCart;
        } catch (error) {
            throw new Error('Error al agregar un nuevo carrito.');
        }
    }

    async getCartById(cartId) {
        try {
            await this.prepare();
            const cart = await this.Cart.findById(cartId).populate('products.product');
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
            await this.prepare();
            const product = await this.verifyProductExists(productId);
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
            await this.prepare();
            const product = await this.verifyProductExists(productId);
            const cart = await this.verifyCartExists(cartId);
            const updateResult = await this.Cart.updateOne(
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
            await this.prepare();
            const cart = await this.verifyCartExists(cartId);
            for (const { product: productId, quantity } of products) {
                const product = await this.Product.findById(productId);
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
            await this.prepare();
            const product = await this.verifyProductExists(productId);
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
            await this.prepare();
            const cart = await this.verifyCartExists(cartId);
            await this.Cart.updateOne({ _id: cartId }, { $set: { products: [] } });
        } catch (error) {
            throw new Error('Hubo un error al vaciar el carrito.');
        }
    }

    async deleteCart(cartId) {
        try {
            await this.prepare();
            const cart = await this.verifyCartExists(cartId);
            await this.Cart.deleteOne({ _id: cartId });
        } catch (error) {
            throw new Error('Hubo un error al eliminar el carrito.');
        }
    }
}

module.exports = daoCarts;
