// require('dotenv').config();
// const mongoose = require('mongoose');
// const supertest = require('supertest');
// const server = require('../../src/app');
// const User = require('../../src/models/user.model');
// const { generateToken } = require('../../src/utils/jwt'); // Asegúrate de importar generateToken

// const request = supertest(server);

// describe('Session Router Tests', function () {
//     this.timeout(10000); // Configurar el tiempo de espera para los tests
//     let token;

//     before(async () => {
//         const chai = await import('chai');
//         global.expect = chai.expect;

//         await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
//     });

//     after(async () => {
//         await mongoose.connection.db.dropDatabase();
//         await mongoose.connection.close();
//     });

//     it('should register a new user', async () => {
//         const userData = {
//             firstName: 'John',
//             lastName: 'Doe',
//             age: 30,
//             email: 'john.doe@example.com',
//             password: 'password'
//         };

//         const response = await request
//             .post('/sessions/register')
//             .send(userData);

//         expect(response.status).to.equal(201);
//         expect(response.body).to.have.property('message', 'Usuario registrado con éxito');
//         expect(response.body.user).to.have.property('email', userData.email);
//     });

//     it('should log in the user', async () => {
//         const loginData = {
//             email: 'john.doe@example.com',
//             password: 'password'
//         };

//         const response = await request
//             .post('/sessions/login')
//             .send(loginData);

//         expect(response.status).to.equal(200);
//         expect(response.body).to.have.property('token');
//         token = response.body.token;
//     });

//     it('should get the current session', async () => {
//         const response = await request
//             .get('/sessions/current')
//             .set('Authorization', `Bearer ${token}`);

//         expect(response.status).to.equal(200);
//         expect(response.body).to.have.property('email', 'john.doe@example.com');
//     });
// });
