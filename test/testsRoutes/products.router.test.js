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

describe('Product Creation Test', function () {
    this.timeout(60000);
    let token;
    let connection = null;
    let request;

    before(async function () {
        const chai = await import('chai');
        global.expect = chai.expect;

        connection = await connectDB();

        const adminEmail = process.env.ADMIN_MAIL;
        const adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            await User.create({
                firstName: 'Admin',
                lastName: 'User',
                age: 30,
                email: adminEmail,
                password: process.env.ADMIN_PASS,
                role: 'admin',
                cartId: null
            });
        }

        await User.deleteMany({ email: 'testuser@example.com' });

        const cart = await Cart.create({ products: [] });
        const user = await User.create({
            firstName: 'Test',
            lastName: 'User',
            age: 30,
            email: 'testuser@example.com',
            password: 'password',
            role: 'premium',
            cartId: cart._id
        });
        token = generateToken(user);

        request = supertest(server);
    });

    after(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    });

    it('should create a product correctly', async function () {
        const mockProduct = {
            title: 'Test Product',
            description: 'Product Description',
            price: 100,
            thumbnail: 'null',
            code: 'uniqueCodeTest',
            stock: 50,
            category: 'Prueba',
            owner: 'admin_id'
        };

        const response = await request
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send(mockProduct)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).to.be.an('object');
        expect(response.body._id).to.exist;
        expect(response.body.title).to.equal('Test Product');
        expect(response.body.description).to.equal('Product Description');
        expect(response.body.price).to.equal(100);
        expect(response.body.thumbnail).to.equal('null');
        expect(response.body.code).to.equal('uniqueCodeTest');
        expect(response.body.stock).to.equal(50);
        expect(response.body.category).to.equal('Prueba');
        expect(response.body.owner).to.equal('admin_id');
    });
});
