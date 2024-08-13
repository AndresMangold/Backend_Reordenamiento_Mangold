require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';

const config = {
    development: {
        dbName: process.env.DB_NAME,
        mongoUrl: process.env.MONGO_URL,
    },
    test: {
        dbName: process.env.DB_NAME_TEST,
        mongoUrl: process.env.MONGODB_URI,
    }
};

module.exports = config[environment];
