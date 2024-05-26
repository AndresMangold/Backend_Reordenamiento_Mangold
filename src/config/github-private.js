require('dotenv').config();

module.exports = {
    appId: process.env.appId,
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: process.env.callbackURL,
    JWT_SECRET: process.env.JWT_SECRET
}
