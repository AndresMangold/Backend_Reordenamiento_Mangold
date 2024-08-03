const mongoose = require('mongoose');
const User = require('../models/user.model'); 
const Product = require('../models/product.model'); 

const canDeleteProduct = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const product = await Product.findById(req.params.pid);

        if (!user || !product) {
            return res.status(404).json({ error: 'User or product not found' });
        }

        if (user.role === 'premium' && product.owner.toString() === user._id.toString()) {
            return next();
        }

        if (user.role === 'admin') {
            return next();
        }

        res.status(403).json({ error: 'User cannot delete this product' });
    } catch (error) {
        res.status(500).json({ error: 'Error validating permissions' });
    }
};

module.exports = {
    userIsLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return res.redirect('/sessions/login');
        }
    },

    userIsNotLoggedIn: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            return res.status(401).json({ error: 'User should not be logged in!' });
        }
    },

    userIsAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
            return next();
        } else {
            const error = new Error('User is not an admin');
            next(error);
        }
    },    

    isUserPremium: (req, res, next) => {
        if (req.user && (req.user.role === 'admin' || req.user.role === 'premium')) {
            return next();
        }
        req.logger.warning('Acceso denegado: Necesitas ser User Premium');
        return res.status(403).json({ message: 'Acceso denegado: Debe tener permisos de user premium' });
    },

    isUser: (req, res, next) => {
        if (req.user && (req.user.role === 'user' || req.user.role === 'premium')) {
            return next();
        }
        req.logger.warning('Acceso denegado: reservado para usuarios');
        return res.status(403).json({ message: 'Acceso denegado: reservado para usuarios' });
    },

    canDeleteProduct 
};
