const mongoose = require('mongoose');
const CartsRepository = require('../../src/dataRepository/carts.dataRepository');
const ProductsRepository = require('../../src/dataRepository/products.dataRepository');
require('dotenv').config();

describe('Testing Cart Repository', () => {
    let chai;
    let expect;
    const cartRepository = new CartsRepository();
    const productRepository = new ProductsRepository();
    let connection = null;

    before(async function () {
        this.timeout(20000); 
        chai = await import('chai');
        expect = chai.expect;
    
        try {
            const mongooseConnection = await mongoose.connect(process.env.MONGODB_URI, {
                dbName: 'testing'
            });
            connection = mongooseConnection.connection;
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    });

    after(async () => {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection to MongoDB closed');
            } catch (error) {
                console.error('Error closing connection to MongoDB:', error);
            }
        }
    });

    beforeEach(async function () {
        this.timeout(10000);
        await mongoose.connection.collection('carts').deleteMany({});
        await mongoose.connection.collection('products').deleteMany({});
    });

    it('El resultado del get debe ser un array', function (done) {
        this.timeout(10000);

        cartRepository.getCarts()
            .then((result) => {
                expect(Array.isArray(result)).to.be.ok;
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('Se debe crear un carrito correctamente', async () => {
        const newCart = await cartRepository.addCart();
        expect(newCart).to.have.property('id');
        expect(newCart.products).to.be.an('array').that.is.empty;
    });

    it('Se debe obtener un carrito según su ID', async () => {
        const newCart = await cartRepository.addCart();
        const findedCart = await cartRepository.getCartById(newCart.id);

        expect(findedCart.id).to.be.equal(newCart.id);
    });

    it('Se debe agregar un producto a un carrito', async () => {

        const mockProduct = {
            title: 'test',
            description: 'Descripcion para el producto',
            price: 200,
            code: `P${Date.now()}`,
            stock: 20,
            category: 'Prueba',
            owner: new mongoose.Types.ObjectId()
        };
        const product = await productRepository.addProduct(mockProduct);

        const newCart = await cartRepository.addCart();

        const updatedCart = await cartRepository.addProductToCart(newCart.id, product.id, new mongoose.Types.ObjectId());

        expect(updatedCart.products).to.have.lengthOf(1);
        expect(updatedCart.products[0].product.toString()).to.be.equal(product.id);
    });
});
