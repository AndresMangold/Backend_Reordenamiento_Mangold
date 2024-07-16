// require('dotenv').config();
// const mongoose = require('mongoose');
// const supertest = require('supertest');
// const server = require('../../src/app');
// const User = require('../../src/models/user.model');
// const Product = require('../../src/models/product.model');
// const { generateToken } = require('../../src/utils/jwt'); // Asegúrate de importar generateToken

// const request = supertest(server);

// describe('Cart Router Tests', function () {
//     this.timeout(10000); // Configurar el tiempo de espera para los tests
//     let token;
//     let userId;
//     let cartId;
//     let productId;

//     before(async () => {
//         const chai = await import('chai');
//         global.expect = chai.expect;

//         await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
//         const user = await User.create({ email: 'test@example.com', password: 'password', role: 'user' });
//         userId = user._id;
//         token = generateToken(user); // Usar el método de generación de token

//         const response = await request
//             .post('/api/cart')
//             .set('Authorization', `Bearer ${token}`);
//         cartId = response.body.cart._id;
//     });

//     after(async () => {
//         await mongoose.connection.db.dropDatabase();
//         await mongoose.connection.close();
//     });

//     it('should add a product to the cart', async () => {
//         const product = await Product.create({
//             title: 'Test Product',
//             description: 'Product description',
//             price: 300,
//             code: 'abc123',
//             stock: 80,
//             category: 'storage',
//             owner: 'admin'
//         });
//         productId = product._id;

//         const response = await request
//             .post(`/api/cart/${cartId}/product/${productId}`)
//             .set('Authorization', `Bearer ${token}`)
//             .send();

//         expect(response.status).to.equal(200);
//         expect(response.body.cart.products).to.have.lengthOf(1);
//         expect(response.body.cart.products[0].product).to.equal(productId.toString());
//     });

//     it('should remove a product from the cart', async () => {
//         const response = await request
//             .delete(`/api/cart/${cartId}/product/${productId}`)
//             .set('Authorization', `Bearer ${token}`)
//             .send();

//         expect(response.status).to.equal(200);
//         expect(response.body.cart.products).to.be.empty;
//     });

//     it('should update the product quantity in the cart', async () => {
//         await request
//             .post(`/api/cart/${cartId}/product/${productId}`)
//             .set('Authorization', `Bearer ${token}`)
//             .send();

//         const response = await request
//             .put(`/api/cart/${cartId}/product/${productId}`)
//             .set('Authorization', `Bearer ${token}`)
//             .send({ quantity: 5 });

//         expect(response.status).to.equal(200);
//         expect(response.body.cart.products[0].quantity).to.equal(5);
//     });
// });
