const mongoose = require('mongoose');
const UsersRepository = require('../../src/dataRepository/users.dataRepository');

describe('Testing Users Repository', () => {
    let chai;
    let expect;
    const usersRepository = new UsersRepository();
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
        await mongoose.connection.collection('users').deleteMany({});
        await mongoose.connection.collection('carts').deleteMany({});
    });

    it('El resultado del get debe ser un array', function (done) {
        this.timeout(10000);

        usersRepository.getAllUsers()
            .then((result) => {
                expect(Array.isArray(result)).to.be.ok;
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it('Se debe registrar un usuario correctamente', async () => {
        const mockUser = {
            firstName: 'Juan',
            lastName: 'Cualquiera',
            age: 30,
            email: `juan${Date.now()}@example.com`,
            password: 'password123'
        };

        const newUser = await usersRepository.registerUser(
            mockUser.firstName,
            mockUser.lastName,
            mockUser.age,
            mockUser.email,
            mockUser.password
        );

        expect(newUser.id).to.be.ok;
        expect(newUser.email).to.equal(mockUser.email);
    });

    it('Se debe obtener un usuario según su ID', async () => {
        const mockUser = {
            firstName: 'Lorna',
            lastName: 'Cualca',
            age: 25,
            email: `lorna${Date.now()}@example.com`,
            password: 'password123'
        };

        const newUser = await usersRepository.registerUser(
            mockUser.firstName,
            mockUser.lastName,
            mockUser.age,
            mockUser.email,
            mockUser.password
        );

        const findedUser = await usersRepository.getUserById(newUser.id);

        expect(findedUser.id).to.be.equal(newUser.id);
        expect(findedUser.email).to.equal(mockUser.email);
    });

    it('Se debe poder iniciar sesión correctamente', async () => {
        const mockUser = {
            firstName: 'Pedrito',
            lastName: 'Calquiera',
            age: 28,
            email: `pedrito${Date.now()}@example.com`,
            password: 'password123'
        };

        await usersRepository.registerUser(
            mockUser.firstName,
            mockUser.lastName,
            mockUser.age,
            mockUser.email,
            mockUser.password
        );

        const loginResult = await usersRepository.loginUser(mockUser.email, mockUser.password);

        expect(loginResult.user.email).to.equal(mockUser.email);
        expect(loginResult.token).to.be.ok;
    });

    it('Se debe eliminar un usuario correctamente', async () => {
        const mockUser = {
            firstName: 'Barry',
            lastName: 'Cualquiera',
            age: 35,
            email: `barry${Date.now()}@example.com`,
            password: 'password123'
        };

        const newUser = await usersRepository.registerUser(
            mockUser.firstName,
            mockUser.lastName,
            mockUser.age,
            mockUser.email,
            mockUser.password
        );

        await usersRepository.deleteUser(mockUser.email);

        try {
            await usersRepository.getUserById(newUser.id);
            expect.fail('El usuario debería haber sido eliminado');
        } catch (error) {
            expect(error.message).to.include('No se pudo obtener el usuario');
        }
    });
});

