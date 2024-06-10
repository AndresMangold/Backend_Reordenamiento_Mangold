const { Router } = require('express');
const passport = require('passport');
const { Controller } = require('../controllers/session.controller');
const { userIsAdmin, userIsNotLoggedIn } = require('../middlewares/auth.middleware');
const { verifyToken } = require('../utils/jwt');

const router = Router();
const controller = new Controller();
const gitConfig = { failureRedirect: '/sessions/login' };

router.get('/login', userIsNotLoggedIn, (req, res) => { 
    res.render('login'); 
});

router.post('/login', userIsNotLoggedIn, passport.authenticate('login', gitConfig), (req, res) => {
    controller.login(req, res);
});

router.get('/register', (req, res) => { 
    res.render('register'); 
});

router.post('/register', passport.authenticate('register', gitConfig), (req, res) => {
    res.redirect('/api/products');
});

router.get('/profile', (req, res) => { 
    controller.profile(req, res); 
});

router.get('/current', (req, res) => { 
    controller.current(req, res); 
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/githubcallback', passport.authenticate('github', gitConfig), (req, res) => {
    controller.githubCb(req, res);
});

router.get('/logout', (req, res) => { 
    controller.logout(req, res); 
});

router.delete('/', userIsAdmin, (req, res) => { 
    controller.deleteUser(req, res); 
});

module.exports = router;
