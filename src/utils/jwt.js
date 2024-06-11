const jwt = require('jsonwebtoken');
require('dotenv').config();
const UsersRepository = require('../dataRepository/users.dataRepository');

const PRIVATE_KEY = process.env.JWT_SECRET;

const generateToken = user => {
    const token = jwt.sign({ id: user.id, role: user.role }, PRIVATE_KEY, { expiresIn: '24h' });
    return token;
}

const verifyToken = (req, res, next) => {
    const openRoutes = [
        '/sessions/login',
        '/sessions/register',
        '/sessions/github',
        '/sessions/githubcallback'
    ];

    if (openRoutes.includes(req.path)) {
        return next();
    }

    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.redirect('/sessions/login');
    }

    jwt.verify(accessToken, PRIVATE_KEY, (err, decoded) => {
        if (err) {
            return res.redirect('/sessions/login'); 
        }

        if (!decoded || !decoded.id || !decoded.role) {
            return res.redirect('/sessions/login'); 
        }

        req.user = { id: decoded.id, role: decoded.role };
        next();
    });
};


module.exports = { generateToken, verifyToken, secret: PRIVATE_KEY };

