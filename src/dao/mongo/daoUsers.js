const { hashPassword, isValidPassword } = require('../../utils/hashing');
const Users = require('../../models/user.model');
const daoCarts = require('../mongo/daoCarts');
const UserService = require('../../services/user.service');

class daoUsers {
    constructor() {
        this.userService = new UserService();
    }

    async prepare() {
        if (Users.db.readyState !== 1) {
            throw new Error('Debe estar conectado a MongoDB');
        }
    }

    async loginUser(email, password) {
        try {
            this.userService.validateLoginCredentials(email, password);
    
            let user;
            if (this.userService.isAdminUser(email, password)) {
                user = this.userService.adminUser;
            } else {
                user = await Users.findOne({ email });
    
                if (!user) {
                    throw new Error('El usuario no existe');
                }
    
                if (!isValidPassword(password, user.password)) {
                    throw new Error('Credenciales inválidas');
                }
            }
            req.session.user = user;
            return user;
        } catch (error) {
            throw new Error('El usuario o contraseña son incorrectos');
        }
    }
    

    async registerUser(firstName, lastName, age, email, password) {
        try {
            if (email === this.userService.adminUser.email) {
                throw new Error('Error al registrar el usuario');
            }

            const existingUser = await Users.findOne({ email });
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            const cart = await new daoCarts().addCart();

            const user = await this.userService.generateNewUser(firstName, lastName, age, email, password, cart);

            const newUser = await Users.create(user);
            return newUser;
        } catch (err) {
            console.error('Error al registrar el usuario: ', err);
            throw new Error('Error al registrar el usuario.');
        }
    }

    async getUser(id) {
        try {
            if (id === this.userService.adminUser._id) {
                return this.userService.adminUser;
            } else {
                const user = await Users.findOne({ _id: id });
                return user;
            }
        } catch {
            throw new Error('Error al cargar la sesión de usuario');
        }
    }

    async githubLogin(profile) {
        try {
            const user = await Users.findOne({ email: profile._json.email });

            if (!user) {
                const fullName = profile._json.name;
                const firstName = fullName.substring(0, fullName.lastIndexOf(' '));
                const lastName = fullName.substring(fullName.lastIndexOf(' ') + 1);
                const age = 18;
                const password = '123';

                const newUser = await this.registerUser(firstName, lastName, age, profile._json.email, password);
                const accessToken = this.userService.generateAccessToken(newUser);

                return { accessToken, user: newUser };
            }

            const accessToken = this.userService.generateAccessToken(user);
            return { accessToken, user };
        } catch (e) {
            console.error('Error al loguearse con GitHub: ', e);
            throw new Error('Hubo un problema al loguearse.');
        }
    }

    async deleteUser(email) {
        try {
            const user = await Users.findOne({ email });
            await new daoCarts().deleteCartById(user.cartId.toString());
            await Users.deleteOne({ email });
        } catch {
            throw new Error('Hubo un error al eliminar el usuario');
        }
    }
}

module.exports = daoUsers;
