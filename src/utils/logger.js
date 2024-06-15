require('dotenv').config();
const winston = require('winston');

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    }
};

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} / Level: [${level.toUpperCase()}] - Message: ${message}`;
});

const devLogger = winston.createLogger({
    level: 'debug',
    levels: customLevelsOptions.levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new winston.transports.Console()
    ]
});

const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: './errors.log', level: 'error' })
    ]
});

const logger = process.env.LOGGER_ENV === 'production' ? prodLogger : devLogger;

module.exports = { logger };