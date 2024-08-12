const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const canDeleteProduct = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'El usuario no está autenticado' });
        }

        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (user.role === 'admin') {
            return next(); 
        }

        if (product.owner && product.owner.toString() === user._id.toString()) {
            if (user.role === 'premium' || user.role === 'user') {
                return next(); 
            }
        }

        return res.status(403).json({ error: 'El usuario no puede borrar este producto' });
    } catch (error) {
        console.error('Error validando permisos:', error);
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
            return res.status(401).json({ error: 'El usuario no debería estar logueado!' });
        }
    },

    userIsAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
            return next();
        } else {
            const error = new Error('El usuario no es Administrador');
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
