const { hashPassword } = require('../utils/hashing');
const jwt = require('jsonwebtoken');

class UserService {
    constructor() {
        this.adminUser = {
            email: 'admin@example.com',
            password: 'adminpass',
            role: 'admin',
            _id: 'admin_id'
        };
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
