const { Router } = require('express');
const User = require('../dao/models/user.model');
const { userIsNotLoggedIn, userisLoggedIn } = require('../middlewares/auth.middleware');
const passport = require('passport');
const initializePassport = require('../config/passport.config');
const { generateToken } = require('../utils/jwt');
const { DEFAULT_MAX_AGE } = require('../constants');

const router = Router();

initializePassport();

router.get('/', userIsNotLoggedIn, (req, res) => {
    const isLoggedIn = req.isAuthenticated();

    res.render('index', {
        title: 'Home',
        style: ['styles.css'],
        isLoggedIn,
        isNotLoggedIn: !isLoggedIn,
    });
});

router.get('/login', userIsNotLoggedIn, (_, res) => {
    res.render('login', {
        title: 'Login',
        style: ['styles.css'],
    });
});

router.get('/register', userIsNotLoggedIn, (_, res) => {
    res.render('register', {
        title: 'Register',
        style: ['styles.css'],
    });
});

router.post('/login', userIsNotLoggedIn, (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            if (!user) {
                return res.status(400).json({ error: 'Email o contraseña incorrectas.' });
            }

            req.login(user, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error interno del servidor' });
                } 

                const accessToken = generateToken(user);
                res.cookie('accessToken', accessToken, { maxAge: DEFAULT_MAX_AGE, httpOnly: true });
                res.redirect('/api/products');
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    })(req, res, next);
});



router.post('/register', userIsNotLoggedIn, (req, res, next) => {
    passport.authenticate('register', async (err, user, info) => {
        try {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            if (!user) {
                return res.status(400).json({ error: 'El usuario ya está registrado.' });
            }

            req.login(user, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }

                const accessToken = generateToken(user);
                res.cookie('accessToken', accessToken, { maxAge: DEFAULT_MAX_AGE, httpOnly: true });
                res.redirect('/api/products');
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    })(req, res, next);
});

router.get('/profile', userisLoggedIn, async (req, res) => {
    try {
        const user = { ...(req.session.user || req.user._doc) };

        res.render('profile', {
            title: 'My profile',
            style: ['styles.css'],
            user: user,
            isLoggedIn: req.isAuthenticated(),
        });
    } catch (error) {
        console.error('Error al buscar el usuario en la base de datos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/logout', userisLoggedIn, (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        req.session.destroy(() => {
            res.redirect('/login');
        });
    });
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/sessions/githubcallback', passport.authenticate('github', {
    successRedirect: '/api/products',
    failureRedirect: '/login'
})); 

module.exports = router;
