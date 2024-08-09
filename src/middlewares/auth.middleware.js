const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const canDeleteProduct = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User is not authenticated' });
        }

        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user is an admin
        if (user.role === 'admin') {
            return next(); // Allow admin to delete any product
        }

        // Check if the user is the owner of the product and has the correct role
        if (product.owner && product.owner.toString() === user._id.toString()) {
            if (user.role === 'premium' || user.role === 'user') {
                return next(); // Allow owner to delete their own product
            }
        }

        return res.status(403).json({ error: 'User cannot delete this product' });
    } catch (error) {
        console.error('Error validating permissions:', error);
        res.status(500).json({ error: 'Internal server error' });
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
