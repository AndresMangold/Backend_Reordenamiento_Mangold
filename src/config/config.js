require('dotenv').config();

module.exports = {
    dbName: 'ecommerce',
    mongoUrl: process.env.MONGO_URL,
    sessionSecret: process.env.SESSION_SECRET,
    port: process.env.PORT || 8080,
    github: {
        appId: process.env.appId,
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        callbackURL: process.env.callbackURL,
    },
    jwtSecret: process.env.JWT_SECRET,
};
