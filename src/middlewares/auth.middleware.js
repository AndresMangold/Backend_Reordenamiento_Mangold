module.exports = {
    userIsLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return res.redirect('/login');
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
        console.log('Authenticated:', req.isAuthenticated());
        console.log('User:', req.user);
        
        if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
            return next();
        } else {
            return res.status(403).json({ error: 'Access denied! You should be an Admin' });
        }
    }
};
