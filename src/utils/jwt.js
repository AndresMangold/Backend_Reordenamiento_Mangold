const jwt = require('jsonwebtoken');
require('dotenv').config();

const PRIVATE_KEY = process.env.JWT_SECRET;

const generateToken = user => {
    const token = jwt.sign({ id: user.id, role: user.role }, PRIVATE_KEY, { expiresIn: '5m' });
    return token;
}

const generatePasswordRecoveryToken = user => {
    const token = jwt.sign({ id: user.id, email: user.email }, PRIVATE_KEY, { expiresIn: '1h' });
    return token;
}

const verifyPasswordToken = token => {
    try {
        const decoded = jwt.verify(token, PRIVATE_KEY);
        return decoded;
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
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

module.exports = { generateToken, generatePasswordRecoveryToken, verifyPasswordToken, verifyToken, secret: PRIVATE_KEY };
