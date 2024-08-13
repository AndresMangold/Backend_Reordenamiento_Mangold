const mongoose = require('mongoose');
const ProductsRepository = require('../../src/dataRepository/products.dataRepository');

describe('Testing Product Repository', () => {
    let chai;
    let expect;
    const productRepository = new ProductsRepository();
    let connection = null;

    before(async function () {
        this.timeout(20000); 
        chai = await import('chai');
        expect = chai.expect;
    
        try {
            const mongooseConnection = await mongoose.connect('mongodb+srv://andresmangold:andresPass@cluster0.hrz9nqj.mongodb.net/test', {
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
        await mongoose.connection.collection('products').deleteMany({});
    });

    afterEach(async () => {
    });

    it('El resultado del get debe ser un array', function (done) {
        this.timeout(10000); 

        productRepository.getProducts(1, 10)
            .then((result) => {
                expect(Array.isArray(result)).to.be.ok;
                done(); 
            })
            .catch((err) => {
                done(err); 
            });
    });

    it('Se debe obtener un producto según su ID', async () => {
        const mockProduct = {
            title: 'test',
            description: 'Descripcion para el producto',
            price: 200,
            thumbnail: 'Imagen',
            code: `P${Date.now()}`, 
            stock: 20,
            category: 'Prueba',
            owner: new mongoose.Types.ObjectId()
        };

        const newProduct = await productRepository.addProduct(mockProduct);
        const newProductId = newProduct.id;
        const findedProduct = await productRepository.getProductById(newProductId);

        expect(findedProduct.id).to.be.equal(newProduct.id);
    });

    it('Se debe crear un producto correctamente', async function () {
        const mockProduct = {
            title: 'test',
            description: 'Descripcion para el producto',
            price: 200,
            thumbnail: 'Imagen',
            code: `P${Date.now()}`, 
            stock: 20,
            category: 'Prueba',
            owner: new mongoose.Types.ObjectId() 
        };

        const newProduct = await productRepository.addProduct(mockProduct);
        expect(newProduct.id).to.be.ok;
    });

    it('El precio y el stock deben setearse como valores numéricos', async () => {
        const mockProduct = {
            title: 'test',
            description: 'Descripcion para el producto',
            price: '200',
            code: `P${Date.now()}`, 
            stock: '20',
            category: 'Prueba',
            owner: new mongoose.Types.ObjectId() 
        };

        const newProduct = await productRepository.addProduct(mockProduct);

        expect(newProduct.price).to.equal(200);
        expect(newProduct.stock).to.equal(20);
    });

    it('El producto se actualiza de manera correcta', async () => {
        const mockProduct = {
            title: 'test',
            description: 'Descripcion para el producto',
            price: 200,
            code: `P${Date.now()}`, 
            stock: 20,
            category: 'Prueba',
            owner: new mongoose.Types.ObjectId() 
        };

        const newProduct = await productRepository.addProduct(mockProduct);
        const updatedProduct = await productRepository.updateProduct(newProduct.id, { title: 'updatedProduct', stock: 40 });
        const findedProduct = await productRepository.getProductById(newProduct.id);

        expect(updatedProduct.title).to.be.equal(findedProduct.title);
        expect(updatedProduct.stock).to.be.equal(findedProduct.stock);
    });
});
