const userIsLoggedIn = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.redirect('/sessions/login');
};

const userIsNotLoggedIn = (req, res, next) => {
    if (!req.user) {
        return next();
    }
    res.status(401).json({ error: 'User should not be logged in!' });
};

const userIsAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'User is not an admin' });
};

module.exports = {
    userIsLoggedIn,
    userIsNotLoggedIn,
    userIsAdmin
};
