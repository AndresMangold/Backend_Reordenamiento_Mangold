const { hashPassword } = require('../utils/hashing');
const jwt = require('jsonwebtoken');
const UserDAO = require('../dao/mongo/daoUsers'); 
const logger = require('../utils/logger').logger;

class UserService {
    #userDAO;

    constructor() {
        this.#userDAO = new UserDAO();
        (async () => {
            await this.#initializeAdminUser();
        })();
    }

    async #initializeAdminUser() {
        try {
            const adminEmail = process.env.ADMIN_MAIL;
            const adminUserFromDb = await this.#userDAO.findByEmail(adminEmail);

            if (!adminUserFromDb) {
                throw new Error(`Administrador no encontrado en la base de datos con email ${adminEmail}`);
            }

            this.adminUser = {
                email: adminEmail,
                password: process.env.ADMIN_PASS,
                role: 'admin',
                _id: adminUserFromDb._id.toString() 
            };

            logger.info(`Administrador inicializado correctamente en el servicio con ID ${this.adminUser._id}`);
        } catch (error) {
            logger.error('Error al inicializar el administrador en el servicio:', error);
            throw error;
        }
    }

    validateLoginCredentials(email, password) {
        if (!email || !password) {
            throw new Error('Las credenciales de inicio de sesión son inválidas');
        }
    }

    isAdminUser(email, password) {
        return email === this.adminUser.email && password === this.adminUser.password;
    }

    generateNewUser(firstName, lastName, age, email, password, cart) {
        return {
            firstName,
            lastName,
            age,
            email,
            password: hashPassword(password),
            cartId: cart._id,
            role: 'user'
        };
    }

    generateAccessToken(user) {
        return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }
}

module.exports = UserService;
