const UserDAO = require('../dao/mongo/daoUsers');
const { usersTokenDTO } = require('../dto/usersToken.dto');
const { hashPassword, isValidPassword } = require('../utils/hashing');
const jwt = require('jsonwebtoken');
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');
const { generateInvalidCredentialsUserData } = require('../utils/error/errors');
const logger = require('../utils/logger').logger;

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
            logger.warn('Credenciales inválidas proporcionadas.');
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
            logger.warn('Edad inválida proporcionada para un nuevo usuario.');
            throw CustomError.createError({
                name: 'Error en la edad',
                cause: 'Debe ingresar un número válido mayor a 0',
                mensaje: 'Edad inválida',
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
                    logger.warn(`Contraseña incorrecta para el usuario con email ${email}.`);
                    throw CustomError.createError({
                        name: 'Error de logeo',
                        cause: 'Ingresó una contraseña incorrecta. Intente nuevamente o cambie la misma',
                        mensaje: 'Contraseña incorrecta',
                        code: ErrorCodes.INVALID_PASSWORD
                    });
                }
            }

            const token = this.generateAccessToken(user);
            logger.info(`Usuario con email ${email} logueado correctamente.`);
            return { user: new usersTokenDTO(user), token };
        } catch (error) {
            logger.error(`Error al iniciar sesión para el usuario con email ${email}.`, error);
            throw CustomError.createError({
                name: 'Error de logeo',
                cause: 'Ocurrió un problema al validar sus credenciales. Intente nuevamente o cambie su contraseña',
                mensaje: 'No se pudo iniciar sesión',
                code: ErrorCodes.USER_LOGIN_ERROR,
                otherProblems: error
            });
        }
    }

    async registerUser(firstName, lastName, age, email, password) {
        try {
            if (email === this.#adminUser.email) {
                logger.warn(`Intento de registro del usuario administrador con email ${email}.`);
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'No se puede registrar el usuario administrador de esta manera',
                    mensaje: 'No tiene permisos para registrar este usuario',
                    code: ErrorCodes.ADMIN_USER_REGISTRATION_ERROR
                });
            }

            const existingUser = await this.#userDAO.findByEmail(email);
            if (existingUser) {
                logger.warn(`Intento de registro con un email ya registrado: ${email}.`);
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'El email se encuentra registrado en la base de datos. Intente validar sus credenciales.',
                    mensaje: 'El email ya está registrado',
                    code: ErrorCodes.EMAIL_ALREADY_REGISTERED
                });
            }

            const cart = await new CartsRepository().addCart();
            const user = this.generateNewUser(firstName, lastName, age, email, password, cart);

            const newUser = await this.#userDAO.create(user);
            logger.info(`Usuario con email ${email} registrado correctamente.`);
            return new usersTokenDTO(newUser);
        } catch (error) {
            logger.error(`Error al registrar el usuario con email ${email}.`, error);
            throw CustomError.createError({
                name: 'Error de registro',
                cause: 'Algo salió mal al registrar un nuevo usuario.',
                mensaje: 'No se pudo crear un nuevo usuario',
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
            logger.info(`Usuario con ID ${id} obtenido correctamente.`);
            return new usersTokenDTO(user);
        } catch (error) {
            logger.error(`Error al obtener el usuario con ID ${id}.`, error);
            throw CustomError.createError({
                name: 'Error al obtener usuario',
                cause: 'Ocurrió un problema al intentar obtener el usuario',
                mensaje: 'No se pudo obtener el usuario',
                code: ErrorCodes.UNDEFINED_USER,
                otherProblems: error
            });
        }
    }

    async getUserById(id) {
        try {
            const user = await this.#userDAO.findById(id);
            logger.info(`Usuario con ID ${id} obtenido correctamente.`);
            return user;
        } catch (error) {
            logger.error(`Error al obtener el usuario por ID ${id}.`, error);
            throw CustomError.createError({
                name: 'Error al obtener usuario por ID',
                cause: 'Ocurrió un problema al intentar obtener el usuario por ID',
                mensaje: 'No se pudo obtener el usuario por ID',
                code: ErrorCodes.UNDEFINED_USER,
                otherProblems: error
            });
        }
    }

    async changeRole(id, role) {
        try {
            return await this.#userDAO.changeRole(id, role);
        } catch (error) {
            logger.error(`Error al cambiar el rol del usuario con ID ${id}.`, error);
            throw CustomError.createError({
                name: 'Error al cambiar el rol',
                cause: 'Ocurrió un problema al intentar cambiar el rol del usuario',
                mensaje: 'No se pudo cambiar el rol del usuario',
                code: ErrorCodes.ROLE_CHANGE_ERROR,
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
            logger.info(`Usuario autenticado con GitHub con email ${profile.email}.`);
            return { accessToken, user: new usersTokenDTO(user) };
        } catch (error) {
            logger.error(`Error de logeo con GitHub para el usuario con email ${profile.email}.`, error);
            throw CustomError.createError({
                name: 'Error de logeo con GitHub',
                cause: 'Ocurrió un error inesperado y no se pudo emparejar su cuenta de GitHub en la base de datos',
                mensaje: 'Hubo un problema con su cuenta de GitHub',
                code: ErrorCodes.GITHUB_LOGIN_ERROR,
                otherProblems: error
            });
        }
    }

    async sendMailToResetPassword(email) {
        if (!email) {
            throw CustomError.createError({
                name: 'Sin email',
                cause: 'Es necesario que ingrese un email para poder continuar con el cambio de contraseña',
                mensaje: 'Debe ingresar un email',
                code: ErrorCodes.UNDEFINED_USER
            });
        }

        const user = await this.#userDAO.findByEmail(email);

        if (!user) {
            throw CustomError.createError({
                name: 'Email desconocido',
                cause: 'Está intentando cambiar la contraseña de un email que no se encuentra registrado',
                mensaje: 'El email no se encuentra registrado',
                code: ErrorCodes.UNDEFINED_USER
            });
        }

        const passToken = await new MailingService().sendMail(email);

        const handlerPassToken = generatePasswordRecoveryToken(passToken.randomNumber, passToken.email);

        return handlerPassToken;
    }

    async resetPassword(urlToken, token, newPassword, confirmPassword) {
        const { code, email } = token;

        if (!newPassword || !confirmPassword) {
            throw CustomError.createError({
                name: 'Datos faltantes',
                cause: 'Es necesario que ingrese una nueva contraseña y la confirmación de la misma',
                mensaje: 'Debe completar todos los cambios',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR
            });
        }

        const isValidToken = urlToken === code.toString();

        if (!isValidToken) {
            throw CustomError.createError({
                name: 'Link inválido',
                cause: 'El link no es válido o ha expirado. Vuelva a enviar el mail de confirmación.',
                mensaje: 'El link no es válido o ha expirado.',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR
            });
        }

        if (newPassword !== confirmPassword) {
            throw CustomError.createError({
                name: 'Contraseña inválida',
                cause: 'Las dos contraseñas ingresadas deben coincidir para poder continuar con la actualización',
                mensaje: 'Las dos contraseñas no coinciden',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR
            });
        }

        const user = await this.#userDAO.findByEmail(email);

        const confirmValidPassword = isValidPassword(newPassword, user.password);

        if (confirmValidPassword) {
            throw CustomError.createError({
                name: 'Contraseña inválida',
                cause: 'La nueva contraseña no puede ser igual a la contraseña anterior.',
                mensaje: 'Debe actualizar su contraseña',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR
            });
        }

        const updatedUser = await this.#userDAO.updatePassword(email, hashPassword(newPassword));

        return updatedUser;
    }

    async getUserByEmail(email) {
        const user = await this.#userDAO.findByEmail(email);
        return user;
    }

    async updatePassword(userEmail, newPassword) {
        const hashedPassword = hashPassword(newPassword);
        await this.#userDAO.updatePassword(userEmail, hashedPassword);
    }

    async deleteUser(email) {
        try {
            const user = await this.#userDAO.findByEmail(email);
            if (!user) {
                logger.warn(`Intento de eliminación de un usuario con un email no registrado: ${email}.`);
                throw CustomError.createError({
                    name: 'Email desconocido',
                    cause: 'Está intentando eliminar un usuario con un email que no se encuentra registrado',
                    mensaje: 'El email no se encuentra registrado',
                    code: ErrorCodes.UNDEFINED_USER
                });
            }

            await new CartsRepository().deleteCart(user.cartId.toString());
            await this.#userDAO.deleteByEmail(email);
            logger.info(`Usuario con email ${email} eliminado correctamente.`);
        } catch (error) {
            logger.error(`Error al eliminar el usuario con email ${email}.`, error);
            throw CustomError.createError({
                name: 'Error al eliminar el usuario',
                cause: 'Su petición no fue procesada de forma correcta y no se pudo eliminar el usuario.',
                mensaje: 'Hubo un problema y no se pudo eliminar el usuario',
                code: ErrorCodes.USER_DELETION_ERROR,
                otherProblems: error
            });
        }
    }
}

module.exports = UsersRepository;
