require('dotenv').config();
const mongoose = require('mongoose');
const supertest = require('supertest');
const server = require('../../src/app'); // Importa el servidor
const PORT = process.env.PORT || 8080;

let chai;
let expect;
let connection = null;
let requester; // Almacenar la instancia de requester
let appServer; // Variable para almacenar la instancia del servidor

describe('Testing Ecommerce', () => {
    let connection = null;

    before(async function () {
        this.timeout(10000); // Configurar el tiempo de espera para la conexión

        const mongooseConnection = await mongoose.connect(process.env.MONGODB_URI, { dbName: 'testing' });
        connection = mongooseConnection.connection;

        // Iniciar el servidor solo para pruebas
        appServer = server.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });

        requester = supertest(`http://localhost:${PORT}`); // Usa supertest con la URL del servidor

        // Importar chai dinámicamente
        chai = await import('chai');
        expect = chai.expect;
    });

    after(async () => {
        // Cerrar la conexión a la base de datos
        if (connection) {
            await connection.close();
            console.log('Connection to MongoDB closed');
        }
    });

    beforeEach(async function () {
        this.timeout(10000);
        
        // Limpiar las colecciones necesarias
        await mongoose.connection.collection('products').deleteMany({});
        await mongoose.connection.collection('carts').deleteMany({});
        await mongoose.connection.collection('users').deleteMany({});
    });

    // Función auxiliar para autenticación
    const authenticateAdminUser = async () => {
        const user = { email: process.env.ADMIN_MAIL, password: process.env.ADMIN_PASS };
        const loginResponse = await requester.post('/api/users/login').send(user);
        return loginResponse.headers['set-cookie'][0];
    };

    // Función auxiliar para crear un producto
    const createProduct = async (cookie, productData) => {
        return requester.post('/api/products').set('Cookie', cookie).send(productData);
    };

    // Función auxiliar para crear un carrito
    const createCart = async (cookie) => {
        return requester.post('/api/cart').set('Cookie', cookie);
    };

    // Función auxiliar para crear y logear un usuario
    const simpleRegisterAndLoginUser = async (email, password) => {
        const user = { email, password };
        await requester.post('/api/users/register').send(user);
        const loginResponse = await requester.post('/api/users/login').send(user);
        return loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta
    };

    describe('Test de productos', () => {
        it('El endpoint GET /api/products debe devolver todos los productos de la base de datos o un array vacio', function (done) {
            requester.get('/api/products')
                .then(({ statusCode, ok, body }) => {
                    expect(statusCode).to.equal(200);
                    expect(ok).to.equal(true);
                    expect(Array.isArray(body)).to.be.ok;
                    done();
                })
                .catch(done);
        });

        it('El endpoint GET /api/products debe devolver un error si se accede a una página que no existe', function (done) {
            requester.get('/api/products?page=error')
                .then(({ statusCode, ok, body }) => {
                    expect(statusCode).to.equal(400);
                    expect(ok).to.equal(false);
                    expect(body.error).to.have.property('cause');
                    expect(body.error.code).to.equal(6);
                    done();
                })
                .catch(done);
        });

        it('El endpoint GET /api/products/:pid debe devolver un producto según su ID', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc123',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;
            const { statusCode, ok, body } = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body.title).to.equal('Test Product');
            expect(body.thumbnail).to.equal('Sin Imagen');
        });

        it('El endpoint GET /api/product/:pid debe devolver un error si el ID no existe', function (done) {
            const pid = 'falsoPID';

            requester.get(`/api/products/${pid}`)
                .then(({ statusCode, ok, body }) => {
                    expect(statusCode).to.equal(404);
                    expect(ok).to.equal(false);
                    expect(body.error).to.have.property('cause');
                    expect(body.error.name).to.equal('El producto no existe');
                    expect(body.error.code).to.equal(3);
                    done();
                })
                .catch(done);
        });

        it('El endpoint POST /api/products/ debe crear un producto de manera correcta', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc124',
                stock: 80,
                category: 'almacenamiento'
            };

            const { statusCode, ok, body } = await createProduct(cookie, productMock);

            expect(ok).to.equal(true);
            expect(statusCode).to.be.equal(201);
            expect(body).to.have.property('id');
        });

        it('El endpoint POST /api/products/ debe devolver un error al intentar cargar mal un producto', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                description: 'Product description',
                price: 300,
                code: 'abc124df',
                stock: 80,
                category: 'almacenamiento'
            };

            const { statusCode, ok, body } = await createProduct(cookie, productMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(400);
            expect(body.error).to.have.property('cause');
            expect(body.error.name).to.equal('Error al agregar el producto.');
            expect(body.error.code).to.equal(7)
        });

        it('El endpoint POST /api/products/ debe arrojar un error al intentar cargar un producto sin tener los permisos', async () => {

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc124',
                stock: 80,
                category: 'almacenamiento'
            };

            const { statusCode, ok, body } = await requester.post('/api/products').send(productMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(403);
            expect(body).to.have.property('message');
        });

        it('El endpoint POST /api/products/ debe arrojar error al intentar crear un producto con el código duplicado', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc124',
                stock: 80,
                category: 'almacenamiento'
            };

            const { statusCode, ok, body } = await createProduct(cookie, productMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.be.equal(409);
            expect(body.error).to.have.property('cause');
            expect(body.error.code).to.equal(26);
        });

        it('El endpoint PUT /api/product/:pid debe actualizar el producto de forma correcta', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc125',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            const updatedProductMock = {
                title: 'Updated Product',
                price: 350
            };

            const updatedProduct = await requester
                .put(`/api/products/${pid}`)
                .set('Cookie', cookie)
                .send(updatedProductMock);

            expect(product.body.title).to.equal('Test Product');
            expect(product.body.price).to.equal(300);
            expect(updatedProduct.body.title).to.equal('Updated Product');
            expect(updatedProduct.body.price).to.equal(350);
            expect(product.body.stock).to.equal(updatedProduct.body.stock);
            expect(updatedProduct.statusCode).to.equal(201);
            expect(updatedProduct.ok).to.be.ok;
        });

        it('El endpoint PUT /api/product/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc125b',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            const updatedProductMock = {
                title: 'Updated Product',
                price: 350
            };

            const { statusCode, ok, body } = await requester
                .put(`/api/products/${pid}`)
                .send(updatedProductMock);

            expect(product.body.title).to.equal('Test Product');
            expect(product.body.price).to.equal(300);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(403);
            expect(body).to.have.property('message');
        });

        it('El endpoint PUT /api/product/:pid debe arrojar error el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';

            const updatedProductMock = {
                title: 'Updated Product',
                price: 350
            };

            const { statusCode, ok, body } = await requester
                .put(`/api/products/${pid}`)
                .set('Cookie', cookie)
                .send(updatedProductMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body.error).to.have.property('cause');
            expect(body.error.code).to.equal(3);
        });

        it('El endpoint DELETE /api/products/:pid debe eliminar el producto de la base de datos', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc126',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const { statusCode, ok } = await requester
                .delete(`/api/products/${pid}`)
                .set('Cookie', cookie)

            const verifyProduct = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(204);
            expect(ok).to.equal(true);
            expect(verifyProduct.statusCode).to.equal(404);
        });

        it('El endpoint DELETE /api/products/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc12s6',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const { statusCode, ok, body } = await requester.delete(`/api/products/${pid}`);

            const verifyProduct = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(verifyProduct.statusCode).to.equal(200);
            expect(body).to.have.property('message');

        });

        it('El endpoint DELETE /api/products/:pid debe arrojar error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';

            const { statusCode, ok, body } = await requester
                .delete(`/api/products/${pid}`)
                .set('Cookie', cookie)


            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body.error).to.have.property('cause');
        });

    });

    describe('Test de carts', () => {
        it('El endpoint GET /api/cart debe devolver todos los carritos de la base de datos o un array vacio', function (done) {
            requester.get('/api/cart')
                .then(({ statusCode, ok, body }) => {
                    expect(statusCode).to.equal(200);
                    expect(ok).to.equal(true);
                    expect(Array.isArray(body)).to.be.ok;
                    done();
                })
                .catch(done);
        });

        it('El endpoint GET /api/cart/:cid debe devolver un carrito según su ID', async () => {
            const cookie = await authenticateAdminUser();

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            const { statusCode, ok, body } = await requester.get(`/api/cart/${cid}`);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;

        });

        it('El endpoint POST /api/cart debe agregar un nuevo carrito a la base de datos', async () => {
            const cookie = await authenticateAdminUser();

            const { statusCode, ok, body } = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            expect(statusCode).to.equal(201);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
        });

        it('El endpoint POST /api/cart debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const { statusCode, ok, body } = await requester
                .post('/api/cart')

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint POST /api/cart/:cid/product/:pid debe agregar un producto al carrito', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc126',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);
            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test@test.com', '123');

            const { statusCode, ok, body } = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product).to.equal(pid);
        });

        it('El endpoint POST /api/cart/:cid/product/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc126g',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);
            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const { statusCode, ok, body } = await requester
                .post(`/api/cart/${cid}/product/${pid}`)

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint POST /api/cart/:cid/product/:pid debe arrojar error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test@test.com', '123');

            const { statusCode, ok, body } = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint DELETE /api/cart/:cid/product/:pid debe eliminar un producto del carrito', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc127g',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test2@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products).to.deep.equal([]);
        });

        it('El endpoint PUT /api/cart/:cid debe actualizar el carrito de forma correcta', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc128',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: 20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .set('Cookie', cookieUser) // Incluir la cookie en el encabezado
                .send(productToUpdate);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product._id).to.equal(pid);
            expect(body.products[0].quantity).to.equal(20);
        });

        it('El endpoint PUT /api/cart/:cid debe arrojar error si la petición es inválida', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc128b',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: -20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .set('Cookie', cookieUser) // Incluir la cookie en el encabezado
                .send(productToUpdate);

            expect(statusCode).to.equal(400);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint PUT /api/cart/:cid debe arrojar un error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc128c',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: 20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .send(productToUpdate);

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint PUT /api/cart/:cid debe arrojar un error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';


            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: 20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .set('Cookie', cookieUser) // Incluir la cookie en el encabezado
                .send(productToUpdate);

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe actualizar la cantidad de producto en el carrito', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc129',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test4@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)
                .send(quantity);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product._id).to.equal(pid);
            expect(body.products[0].quantity).to.equal(20);
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc129b',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            expect(cart.body).to.have.property('_id');

            const cid = cart.body._id;

            const cookieUser = await simpleRegisterAndLoginUser('test4b@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}/product/${pid}`)
                .send(quantity);

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe arrojar error si el carrito no existe', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc129c',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            expect(cart.body).to.have.property('_id');

            const cid = cart.body._id;

            const cookieUser = await simpleRegisterAndLoginUser('test4b@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/noCart/product/${pid}`)
                .set('Cookie', cookieUser)
                .send(quantity);

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe arrojar error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc129bf',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            expect(cart.body).to.have.property('_id');

            const cid = cart.body._id;

            const cookieUser = await simpleRegisterAndLoginUser('test4b@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}/product/noPid`)
                .set('Cookie', cookieUser)
                .send(quantity);

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint DELETE /api/cart/:cid debe vaciar el carrito de forma correcta', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc130b',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test5b@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.ok).to.equal(true);
            expect(updatedCart.body).to.have.property('_id');
            expect(Array.isArray(updatedCart.body.products)).to.be.ok;
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok } = await requester
                .delete(`/api/cart/${cid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(204);
            expect(ok).to.equal(true);
        });

        it('El endpoint DELETE /api/cart/:cid debe arrojar un error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc130bb',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test5fb@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.ok).to.equal(true);
            expect(updatedCart.body).to.have.property('_id');
            expect(Array.isArray(updatedCart.body.products)).to.be.ok;
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/${cid}`)

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint DELETE /api/cart/:cid debe arrojar un error si el carrito no existe', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc130gb',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test5sb@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.ok).to.equal(true);
            expect(updatedCart.body).to.have.property('_id');
            expect(Array.isArray(updatedCart.body.products)).to.be.ok;
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/noCart`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause')
        });
    });

    describe('Test de users', () => {

        it('El endpoint POST /api/users/premium/:uid debe cambiar el rol de usuario a premium', async () => {
            const cookie = await simpleRegisterAndLoginUser('testRol@test.com', '123');

            const currentUser = await requester
                .get('/api/users/current')
                .set('Cookie', cookie);

            expect(currentUser.body.email).to.equal('testRol@test.com');
            expect(currentUser.body.role).to.equal('user');
            expect(currentUser.body).to.have.property('id');

            await requester
                .post(`/api/users/${currentUser.body.id}/documents`)
                .set('Cookie', cookie)
                .attach('identification', path.join(__dirname, '../img/Fuente.webp'))
                .attach('proofOfAddress', path.join(__dirname, '../img/Fuente.webp'))
                .attach('proofOfAccount', path.join(__dirname, '../img/Fuente.webp'))

            const updateRol = await requester
                .post(`/api/users/premium/${currentUser.body.id}`);
            expect(updateRol.body.firstName).to.equal(currentUser.body.firstName);
            expect(updateRol.body.id).to.equal(currentUser.body.id);
            expect(updateRol.body.cart).to.equal(currentUser.body.cart);
            expect(updateRol.body.role).to.equal('premium');
            expect(updateRol.status).to.equal(200);
        });

        it('El endpoint POST /api/users/premium/:uid debe arrojar error si el usuario no existe', async () => {
            const sinID = 'noID'
            const { body, statusCode, ok } = await requester
                .post(`/api/users/premium/${sinID}`);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });
    });
});
