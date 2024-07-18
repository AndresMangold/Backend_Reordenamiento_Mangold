const mongoose = require('mongoose');
const config = require('./dbConfig');

let connection = null;

const connectDB = async () => {
    if (!connection) {
        connection = await mongoose.connect(config.mongoUrl, {
            dbName: config.dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000 
        });
    }
    return connection;
};

module.exports = connectDB;
