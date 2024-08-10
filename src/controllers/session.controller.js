require('dotenv').config();
const bcrypt = require('bcrypt');
const { generateToken, generatePasswordRecoveryToken, verifyPasswordToken } = require('../utils/jwt');
const { isValidPassword } = require('../utils/hashing');
const UsersRepository = require('../dataRepository/users.dataRepository');
const { usersTokenDTO } = require('../dto/usersToken.dto');
const MailingService = require('../utils/mailingService');
const CartsRepository = require('../dataRepository/carts.dataRepository'); 
const User = require('../models/user.model');

class Controller {
    constructor() {
        this.usersRepository = new UsersRepository();
        this.mailingService = new MailingService();
    }

    redirect(res) {
        try {
            res.redirect('/api/products');
        } catch (e) {
            req.logger.error(e.message, e);
            res.status(500).json({ error: e.message });
        }
    }

    logError(res) {
        try {
            res.send('Hubo un error al identificar sus credenciales.');
        } catch (e) {
            req.logger.error(e.message, e);
            res.status(500).json({ error: e.message });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
    
        try {
            const { user, token } = await this.usersRepository.loginUser(email, password);
            const userDto = new usersTokenDTO(user);
            req.session.user = userDto;

            res.cookie('accessToken', token, { maxAge: 5 * 60 * 1000, httpOnly: true });
    
            if (user.id !== 'admin_id') {
                await User.findByIdAndUpdate(user.id, { last_connection: new Date() });
            }
    
            req.logger.info('Usuario logueado correctamente.');
            res.redirect(`/api/products?isAdmin=${user.role === 'admin'}`);
        } catch (e) {
            req.logger.error(e.message, e);
            res.status(400).json({ error: e.message });
        }
    }
    

    async register(req, res) {
        const { firstName, lastName, age, email, password } = req.body;
    
        try {
            const newUser = await this.usersRepository.registerUser(firstName, lastName, age, email, password);
            const userDto = new usersTokenDTO(newUser);
            req.logger.info('Usuario registrado con éxito.');

            res.status(201).json({ message: 'Usuario creado con éxito. Redirigiendo a la página de login...', redirectUrl: '/sessions/login' });
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(400).json({ error: error.message });
        }
    }
    

    async current(req, res) {
        try {
            const userId = req.user.id;
            const user = await this.usersRepository.getUserById(userId);
            if (!user) {
                req.logger.warn('Usuario no autenticado.');
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const userDto = new usersTokenDTO(user);
            req.logger.info('Usuario autenticado correctamente.');
            res.json(userDto);
        } catch (e) {
            req.logger.error(e.message, e);
            res.status(500).json({ error: e.message });
        }
    }

    async githubCb(req, res) {
        try {
            const profile = req.user;
            const { accessToken, user } = await this.usersRepository.githubLogin(profile);
            const userDto = new usersTokenDTO(user);
    
            res.cookie('accessToken', accessToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

            if (user.id !== 'admin_id') {
                await User.findByIdAndUpdate(user.id, { last_connection: new Date() });
            }
    
            req.logger.info('Usuario autenticado con GitHub.');
            res.redirect('/api/products');
        } catch (err) {
            req.logger.error(err.message, err);
            res.status(500).json({ error: err.message });
        }
    }

    profile(req, res) {
        try {
            const user = req.user || req.session.user;
            if (!user) {
                req.logger.warn('Usuario no autenticado.');
                return res.status(401).json({ error: 'User not authenticated' });
            }

            this.usersRepository.getUserById(user.id).then((fullUser) => {
                res.render('profile', {
                    title: 'My profile',
                    style: ['styles.css'],
                    user: fullUser, 
                    isLoggedIn: true,
                    isAdmin: fullUser.role === 'admin',  
                });
            }).catch((err) => {
                req.logger.error('Error al buscar el usuario en la base de datos:', err);
                res.status(500).send('Error interno del servidor');
            });
        } catch (err) {
            req.logger.error('Error inesperado al procesar el perfil:', err);
            res.status(500).send('Error interno del servidor');
        }
    }
    

    async sendPasswordResetEmail(req, res) {
        try {
            const { email } = req.body;
            const user = await this.usersRepository.getUserByEmail(email);
            if (!user) {
                return res.status(400).send(`<script>alert('Email no registrado'); window.location.href='/sessions/retrievePass';</script>`);
            }
    
            const token = generatePasswordRecoveryToken(user);
            const resetLink = `${req.protocol}://${req.get('host')}/sessions/resetPassword/${token}`;
    
            const mailOptions = {
                to: email,
                subject: 'Restablecimiento de contraseña',
                html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><a href="${resetLink}">${resetLink}</a>`
            };
    
            await this.mailingService.sendMail(mailOptions);
            
            res.status(200).send(`<script>alert('Correo enviado exitosamente, por favor revise su casilla'); window.location.href='/sessions/login';</script>`);
        } catch (error) {
            req.logger.error('Error al enviar el correo de recuperación:', error);
            res.status(500).send(`<script>alert('No se pudo enviar el email'); window.location.href='/sessions/retrievePass';</script>`);
        }
    }    

    async renderResetPasswordPage(req, res) {
        try {
            const { token } = req.params;
            res.render('resetPassword', { token });
        } catch (error) {
            req.logger.error('Error al renderizar la página de restablecimiento de contraseña:', error);
            res.status(500).send('Error interno del servidor');
        }
    }
    

    async resetPassword(req, res) {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;
        
            if (!newPassword) {
                return res.status(400).send(`<script>alert('Debe ingresar una nueva contraseña'); window.location.href='/sessions/resetPassword/${token}';</script>`);
            }
        
            const decoded = verifyPasswordToken(token);
            const user = await this.usersRepository.getUserById(decoded.id);
        
            if (await isValidPassword(newPassword, user.password)) {
                return res.status(400).send(`<script>alert('No puede usar la misma contraseña anterior'); window.location.href='/sessions/resetPassword/${token}';</script>`);
            }
    
            await this.usersRepository.updatePassword(user.email, newPassword);
            res.status(200).send(`<script>alert('Contraseña actualizada exitosamente'); window.location.href='/sessions/login';</script>`);
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(500).send(`<script>alert('Error al actualizar la contraseña'); window.location.href='/sessions/resetPassword/${token}';</script>`);
        }
    }    

    async changeRole(req, res) {
        try {
            const uid = req.params.uid;
            const user = await this.usersRepository.getUserById(uid);
            if (!user) {
                req.logger.warn('Usuario no encontrado.');
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            if (req.user.id !== uid) {
                req.logger.warn('No tienes permisos para cambiar el rol de este usuario.');
                return res.status(403).json({ error: 'No tienes permisos para cambiar el rol de este usuario.' });
            }

            const newRole = user.role === 'user' ? 'premium' : 'user';
            await this.usersRepository.changeRole(uid, newRole);

            req.logger.info(`Rol del usuario actualizado a ${newRole}`);
            return res.json({ message: `Rol del usuario actualizado a ${newRole}`, user: { ...user._doc, role: newRole } });
        } catch (error) {
            req.logger.error(error.message, error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await this.usersRepository.getAllUsers();
            const usersData = users.map(user => ({
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
                lastConnection: user.last_connection 
            }));
    
            req.logger.info('Usuarios obtenidos correctamente.');
            res.render('admin', {
                titlePage: 'Panel de Admin',
                style: ['styles.css'],
                isLoggedIn: true,
                isAdmin: true,
                users: usersData
            });
        } catch (error) {
            req.logger.error('Error al obtener los usuarios:', error);
            res.status(500).json({ error: error.message });
        }
    }

    logout(req, res) {
        req.logout(async (err) => {
            if (err) {
                req.logger.error(err.message, err);
                return res.status(500).json({ error: err.message });
            }
    
            if (req.user) {
                await User.findByIdAndUpdate(req.user.id, { last_connection: new Date() });
            }
    
            req.session.destroy((err) => {
                if (err) {
                    req.logger.error(err.message, err);
                    return res.status(500).json({ error: err.message });
                }
                res.clearCookie('connect.sid', { httpOnly: true, secure: true });
                res.clearCookie('accessToken', { httpOnly: true, secure: true });
                req.logger.info('Usuario deslogueado correctamente.');
                res.redirect('/sessions/login');
            });
        });
    }
    

    async deleteUser(req, res) {
        try {
            const { email } = req.body;
            await this.usersRepository.deleteUser(email);
            req.logger.info(`Usuario ${email} eliminado correctamente.`);
            res.json({ message: 'Usuario eliminado correctamente.' });
        } catch (e) {
            req.logger.error(e.message, e);
            res.status(500).json({ error: e.message });
        }
    }

    async deleteInactiveUsers(req, res) {
        try {
            const inactivityLimit = 2 * 24 * 60 * 60 * 1000;
            const now = Date.now();

            const inactiveUsers = await User.find({
                role: { $ne: 'admin' }, 
                last_connection: { $lt: new Date(now - inactivityLimit) }
            });
    
            for (const user of inactiveUsers) {
                await this.mailingService.sendMail({
                    to: user.email,
                    subject: 'Cuenta Eliminada por Inactividad',
                    html: `
                        <div>
                            <h2>Cuenta Eliminada</h2>
                            <p>Tu cuenta ha sido eliminada debido a la inactividad durante los últimos 2 días o más.</p>
                        </div>`
                });
    
                await this.usersRepository.deleteUser(user.email);
            }
    
            req.logger.info(`Usuarios inactivos eliminados correctamente.`);
            res.json({ message: 'Usuarios inactivos eliminados correctamente.' });
        } catch (error) {
            req.logger.error('Error al eliminar usuarios inactivos:', error);
            res.status(500).json({ error: 'Error al eliminar usuarios inactivos.' });
        }
    }
    
}

module.exports = { Controller };
