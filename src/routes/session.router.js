require('dotenv').config();
const { Router } = require('express');
const passport = require('passport');
const { Controller } = require('../controllers/session.controller');

const router = Router();
const controller = new Controller();

router.get('/login', (req, res) => { res.render('login'); });

router.post('/login', passport.authenticate('login', { failureRedirect: '/login', session: false }), (req, res) => { res.redirect('/api/products'); });

router.get('/register', (req, res) => { res.render('register'); });

router.post('/register', passport.authenticate('register', { failureRedirect: '/login', session: false }), (req, res) => { res.redirect('/api/products'); });

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => controller.current(req, res));

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/githubcallback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), (req, res) => controller.githubCb(req, res));

router.get('/logout', (req, res) => controller.logout(req, res));

router.delete('/', (req, res) => controller.deleteUser(req, res));

module.exports = router;
