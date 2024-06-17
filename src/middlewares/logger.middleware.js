const logger = require('../utils/logger').logger;

const useLogger = (req, res, next) => {
    req.logger = logger;
    next();
};

module.exports = { useLogger };
