require('dotenv').config();
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const supertest = require('supertest');
const server = require('../../src/app');
const User = require('../../src/models/user.model');
const Cart = require('../../src/models/cart.model');
const { generateToken } = require('../../src/utils/jwt');
const ProductsRepository = require('../../src/dataRepository/products.dataRepository');
const connectDB = require('../../src/db');

describe('Product Router Tests', function () {
    this.timeout(60000); 
    let token;
    const productRepository = new ProductsRepository();
    let connection = null;
    let request;

    before(async function () {
        const chai = await import('chai');
        global.expect = chai.expect;

        connection = await connectDB(); 

        await User.deleteMany({ email: 'user@example.com' });

        const cart = await Cart.create({ products: [] });
        const user = await User.create({ 
            firstName: 'Test', 
            lastName: 'User', 
            age: 30, 
            email: 'user@example.com', 
            password: 'password', 
            role: 'premium', 
            cartId: cart._id 
        });
        token = generateToken(user);

        request = supertest(server); 
    });

    after(async () => {
        if (connection) {
            await connection.db.dropDatabase();
            await connection.close();
        }
    });

    it('should get all products', async function () {
        const response = await request
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).to.be.an('array');
    });

    it('should handle redirection properly', async function () {
        const response = await request
            .get('/api/products')
            .expect(302);

        console.log(response.headers.location); 
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
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body._id).to.equal(newProductId.toString());
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

        const response = await request
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send(mockProduct)
            .expect(201);

        expect(response.body._id).to.be.ok;
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

        const response = await request
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send(mockProduct)
            .expect(201);

        expect(response.body._id).to.be.ok;
        expect(response.body.thumbnail).to.be.equal('null');
        expect(response.body.status).to.be.true;
        expect(response.body.owner).to.be.equal('admin_id');
    });

    it('should set price and stock as numeric values', async () => {
        const mockProduct = {
            title: 'test-4',
            description: 'Descripcion',
            price: '20000',
            code: 'uniqueCode4',
            stock: '20',
            category: 'Madera',
            owner: 'admin_id'
        };

        const response = await request
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send(mockProduct)
            .expect(201);

        expect(response.body.price).to.equal(20000);
        expect(response.body.stock).to.equal(20);
    });

    it('should update a product correctly', async () => {
        const mockProduct = {
            title: 'test-5',
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
            .send(updatedProductData)
            .expect(200);

        expect(response.body.title).to.equal('updatedProduct');
        expect(response.body.stock).to.equal(40);
    });
});
