const UserDAO = require('../dao/mongo/daoUsers');
const { usersTokenDTO } = require('../dto/usersToken.dto');
const { hashPassword, isValidPassword } = require('../utils/hashing'); // Importar isValidPassword
const jwt = require('jsonwebtoken');

class UsersRepository {
    #userDAO;
    #adminUser;

    constructor() {
        this.#userDAO = new UserDAO();
        this.#adminUser = {
            email: 'adminCoder@coder.com',
            password: 'adminCod3r123',
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
        return email === this.#adminUser.email && password === this.#adminUser.password;
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

    async loginUser(email, password) {
        this.validateLoginCredentials(email, password);

        let user;
        if (this.isAdminUser(email, password)) {
            user = this.#adminUser;
        } else {
            user = await this.#userDAO.findByEmail(email);
            if (!user || !isValidPassword(password, user.password)) { 
                throw new Error('Credenciales inválidas');
            }
        }

        const token = this.generateAccessToken(user); 
        return { user: new usersTokenDTO(user), token }; 
    }

    async registerUser(firstName, lastName, age, email, password) {
        if (email === this.#adminUser.email) {
            throw new Error('Error al registrar el usuario');
        }

        const existingUser = await this.#userDAO.findByEmail(email);
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        const cart = await new CartsRepository().addCart();

        const user = this.generateNewUser(firstName, lastName, age, email, password, cart);

        const newUser = await this.#userDAO.create(user);
        return new usersTokenDTO(newUser);
    }

    async getUser(id) {
        let user;
        if (id === this.#adminUser._id) {
            user = this.#adminUser;
        } else {
            user = await this.#userDAO.findById(id);
        }

        return new usersTokenDTO(user);
    }

    async githubLogin(profile) {
        let user = await this.#userDAO.findByEmail(profile.email);
    
        if (!user) {
            const fullName = profile.name || profile.login;
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ');
            const age = 30;
            const password = ''; 
    
            user = await this.registerUser(firstName, lastName, age, profile.email, password);
        }
    
        const accessToken = this.generateAccessToken(user);
        return { accessToken, user: new usersTokenDTO(user) };
    }
    
    async deleteUser(email) {
        const user = await this.#userDAO.findByEmail(email);
        if (!user) throw new Error('Usuario no encontrado');

        await new CartsRepository().deleteCart(user.cartId.toString());
        await this.#userDAO.deleteByEmail(email);
    }
}

module.exports = UsersRepository;
