require('dotenv').config();
const mongoose = require('mongoose');
const supertest = require('supertest');
const server = require('../../src/app');
const User = require('../../src/models/user.model');
const { generateToken } = require('../../src/utils/jwt'); 
const ProductsRepository = require('../../src/dataRepository/products.dataRepository');
const sinon = require('sinon');

describe('Product Router Tests', function () {
    this.timeout(25000); 
    let token;
    const productRepository = new ProductsRepository();
    let connection = null;

    before(async function () {
        const chai = await import('chai');
        global.expect = chai.expect;

        const mongooseConnection = await mongoose.connect(process.env.MONGO_URL, { dbName: 'test' });
        connection = mongooseConnection.connection;

        await User.deleteMany({ email: 'user@example.com' });

        const user = await User.create({ email: 'user@example.com', password: 'password', role: 'user' });
        token = generateToken(user);
    });

    after(async () => {
        await connection.close();
    });


    it.only('should get all products', async function () {
        // const response = await request
        // //     .get('/api/products')
        // //     .set('Authorization', `Bearer ${token}`);

        // // expect(response.status).to.equal(200);
        // // expect(response.body).to.be.an('array');


        // const renderStub = sinon.stub();
        // const res = {render: renderStub, status: sinon.stub().returnsThis()};

        // await request(server).get('/api/products').set('Authorization', `Bearer ${token}`).expect('Content-Type', /html/).expect(200).end(function(err, res){
        //     if (err) {
        //         return done(err);
        //     } 
        //     return done();
        // })

        const response = await supertest(server)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect(302)
            .then(function(res) {
                console.log(res)
            })
    });


    it('should get a specific product by ID', async () => {
        const mockProduct = {
            title: 'test',
            description: 'Descripcion',
            price: 200,
            thumbnail: 'null',
            code: 'uniqueCode1',
            stock: 20000,
            category: 'Madera',
            owner: 'admin_id'
        };

        const newProduct = await productRepository.addProduct(mockProduct);
        const newProductId = newProduct._id;

        const response = await request
            .get(`/api/products/${newProductId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).to.equal(200);
        expect(response.body._id).to.equal(newProduct._id.toString());
    });

    it('should create a product correctly', async function () {
        const mockProduct = {
            title: 'test-1',
            description: 'Descripcion',
            price: 20000,
            thumbnail: 'null',
            code: 'uniqueCode2',
            stock: 20,
            category: 'Madera',
            owner: 'admin_id'
        };

        const newProduct = await productRepository.addProduct(mockProduct);
        expect(newProduct._id).to.be.ok;
    });

    it('should set thumbnail, owner and status automatically', async () => {
        const mockProduct = {
            title: 'test-3',
            description: 'Descripcion ',
            price: 20000,
            code: 'uniqueCode3',
            stock: 20,
            category: 'Madera',
            owner: 'admin_id'
        };

        const newProduct = await productRepository.addProduct(mockProduct);

        expect(newProduct._id).to.be.ok;
        expect(newProduct.thumbnail).to.be.equal('null');
        expect(newProduct.status).to.be.true;
        expect(newProduct.owner).to.be.equal('admin_id');
    });

    it('should set price and stock as numeric values', async () => {
        const mockProduct = {
            title: 'test-3',
            description: 'Descripcion',
            price: '20000',
            code: 'uniqueCode4',
            stock: '20',
            category: 'Madera',
            owner: 'admin_id'
        };

        const newProduct = await productRepository.addProduct(mockProduct);

        expect(newProduct.price).to.equal(20000);
        expect(newProduct.stock).to.equal(20);
    });

    it('should update a product correctly', async () => {
        const mockProduct = {
            title: 'test-4',
            description: 'Descripcion',
            price: 200000,
            code: 'uniqueCode5',
            stock: 20000,
            category: 'Madera',
            owner: 'admin_id'
        };

        const newProduct = await productRepository.addProduct(mockProduct);
        const updatedProductData = { title: 'updatedProduct', stock: 40 };

        const response = await request
            .put(`/api/products/${newProduct._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedProductData);

        expect(response.status).to.equal(200);
        expect(response.body.title).to.equal('updatedProduct');
        expect(response.body.stock).to.equal(40);
    });
});
