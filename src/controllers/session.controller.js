require('dotenv').config(); 
const { generateToken } = require('../utils/jwt');
const UsersRepository = require('../dataRepository/users.dataRepository');
const { usersTokenDTO } = require('../dto/usersToken.dto');  

class Controller {
    constructor() {
        this.usersRepository = new UsersRepository();
    }

    redirect(res) {
        try {
            res.redirect('/api/products');
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    logError(res) {
        try {
            res.send('Hubo un error al identificar sus credenciales.');
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
    
        try {
            const { user, token } = await this.usersRepository.loginUser(email, password);
            const userDto = new usersTokenDTO(user);
            req.session.user = userDto;
            res.cookie('accessToken', token, { maxAge: 60 * 60 * 1000, httpOnly: true });
            res.redirect('/api/products'); 
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    async register(req, res) {
        const { firstName, lastName, age, email, password } = req.body;

        try {
            const newUser = await this.usersRepository.registerUser(firstName, lastName, age, email, password);
            const userDto = new usersTokenDTO(newUser);
            res.status(201).json({ message: 'Usuario registrado con éxito', user: userDto });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async current(req, res) {
        try {
            res.json(req.user);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async githubCb(req, res) {
        try {
            const profile = req.user;
            const { accessToken, user } = await this.usersRepository.githubLogin(profile);
            const userDto = new usersTokenDTO(user);
    
            res.cookie('accessToken', accessToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            res.redirect('/api/products'); 
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
    

    profile(req, res) {
        try {
            const user = req.user || req.session.user;
            if (!user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            res.render('profile', {
                title: 'My profile',
                style: ['styles.css'],
                user: user,
                isLoggedIn: true,
            });
        } catch (err) {
            console.error('Error al buscar el usuario en la base de datos:', err);
            res.status(500).send('Error interno del servidor');
        }
    }

    logout(req, res) {
        req.logout((err) => {
            if (err) { 
                console.error("Error during logout:", err);
                return res.status(500).json({ error: err.message }); 
            }
            req.session.destroy((err) => {
                if (err) { 
                    console.error("Error destroying session:", err);
                    return res.status(500).json({ error: err.message }); 
                }
                res.clearCookie('connect.sid');
                res.clearCookie('accessToken');
                res.redirect('/sessions/login'); 
            });
        });
    }

    async deleteUser(req, res) {
        try {
            const { email } = req.body;
            await this.usersRepository.deleteUser(email);
            res.json({ message: 'Usuario eliminado correctamente.' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = { Controller };
