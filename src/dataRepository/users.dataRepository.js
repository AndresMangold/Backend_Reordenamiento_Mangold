const UserDAO = require('../dao/mongo/daoUsers');
const { usersTokenDTO } = require('../dto/usersToken.dto');
const { hashPassword, isValidPassword } = require('../utils/hashing');
const jwt = require('jsonwebtoken');
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');
const { generateInvalidCredentialsUserData } = require('../utils/error/errors');
const { ObjectId } = require('mongodb');

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
            throw CustomError.createError({
                name: 'Credenciales inválidas',
                cause: generateInvalidCredentialsUserData({ email, password }),
                message: 'Debe ingresar un usuario y contraseña válidos',
                code: ErrorCodes.INVALID_CREDENTIALS
            });
        }
    }

    isAdminUser(email, password) {
        return email === this.#adminUser.email && password === this.#adminUser.password;
    }

    generateNewUser(firstName, lastName, age, email, password, cart) {
        if (age <= 0) {
            throw CustomError.createError({
                name: 'Error en la edad',
                cause: 'Debe ingresar un número válido mayor a 0',
                message: 'Edad inválida',
                code: ErrorCodes.AGE_VALIDATION_ERROR
            });
        }

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
        try {
            this.validateLoginCredentials(email, password);

            let user;
            if (this.isAdminUser(email, password)) {
                user = this.#adminUser;
            } else {
                user = await this.#userDAO.findByEmail(email);
                if (!user || !isValidPassword(password, user.password)) {
                    throw CustomError.createError({
                        name: 'Error de logeo',
                        cause: 'Ingresó una contraseña incorrecta. Intente nuevamente o cambie la misma',
                        message: 'Contraseña incorrecta',
                        code: ErrorCodes.INVALID_PASSWORD
                    });
                }
            }

            const token = this.generateAccessToken(user);
            return { user: new usersTokenDTO(user), token };
        } catch (error) {
            throw CustomError.createError({
                name: 'Error de logeo',
                cause: 'Ocurrió un problema al validar sus credenciales. Intente nuevamente o cambie su contraseña',
                message: 'No se pudo iniciar sesión',
                code: ErrorCodes.USER_LOGIN_ERROR,
                otherProblems: error
            });
        }
    }

    async registerUser(firstName, lastName, age, email, password) {
        try {
            if (email === this.#adminUser.email) {
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'No se puede registrar el usuario administrador de esta manera',
                    message: 'No tiene permisos para registrar este usuario',
                    code: ErrorCodes.ADMIN_USER_REGISTRATION_ERROR
                });
            }

            const existingUser = await this.#userDAO.findByEmail(email);
            if (existingUser) {
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'El email se encuentra registrado en la base de datos. Intente validar sus credenciales.',
                    message: 'El email ya está registrado',
                    code: ErrorCodes.EMAIL_ALREADY_REGISTERED
                });
            }

            const cart = await new CartsRepository().addCart();
            const user = this.generateNewUser(firstName, lastName, age, email, password, cart);

            const newUser = await this.#userDAO.create(user);
            return new usersTokenDTO(newUser);
        } catch (error) {
            throw CustomError.createError({
                name: 'Error de registro',
                cause: 'Algo salió mal al registrar un nuevo usuario.',
                message: 'No se pudo crear un nuevo usuario',
                code: ErrorCodes.USER_REGISTER_ERROR,
                otherProblems: error
            });
        }
    }

    async getUser(id) {
        try {
            let user;
            if (id === this.#adminUser._id) {
                user = this.#adminUser;
            } else {
                user = await this.#userDAO.findById(id);
            }

            return new usersTokenDTO(user);
        } catch (error) {
            throw CustomError.createError({
                name: 'Error al obtener usuario',
                cause: 'Ocurrió un problema al intentar obtener el usuario',
                message: 'No se pudo obtener el usuario',
                code: ErrorCodes.UNDEFINED_USER,
                otherProblems: error
            });
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findById(id);
            return user;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error al obtener usuario por ID',
                cause: 'Ocurrió un problema al intentar obtener el usuario por ID',
                message: 'No se pudo obtener el usuario por ID',
                code: ErrorCodes.UNDEFINED_USER,
                otherProblems: error
            });
        }
    }

    async githubLogin(profile) {
        try {
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
        } catch (error) {
            throw CustomError.createError({
                name: 'Error de logeo con GitHub',
                cause: 'Ocurrió un error inesperado y no se pudo emparejar su cuenta de GitHub en la base de datos',
                message: 'Hubo un problema con su cuenta de GitHub',
                code: ErrorCodes.GITHUB_LOGIN_ERROR,
                otherProblems: error
            });
        }
    }

    async deleteUser(email) {
        try {
            const user = await this.#userDAO.findByEmail(email);
            if (!user) {
                throw CustomError.createError({
                    name: 'Email desconocido',
                    cause: 'Está intentando eliminar un usuario con un email que no se encuentra registrado',
                    message: 'El email no se encuentra registrado',
                    code: ErrorCodes.UNDEFINED_USER
                });
            }

            await new CartsRepository().deleteCart(user.cartId.toString());
            await this.#userDAO.deleteByEmail(email);
        } catch (error) {
            throw CustomError.createError({
                name: 'Error al eliminar el usuario',
                cause: 'Su petición no fue procesada de forma correcta y no se pudo eliminar el usuario.',
                message: 'Hubo un problema y no se pudo eliminar el usuario',
                code: ErrorCodes.USER_DELETION_ERROR,
                otherProblems: error
            });
        }
    }
}

module.exports = UsersRepository;
