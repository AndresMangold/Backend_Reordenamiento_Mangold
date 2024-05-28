const passport = require('passport');
const { Strategy } = require('passport-github2');
const { clientID, clientSecret, callbackURL } = require('./github-private');
const Users = require('../models/user.model');
const Cart = require('../models/cart.model');

const initializeStrategy = () => {
    passport.use('github', new Strategy({
        clientID,
        clientSecret,
        callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('access token', accessToken);
            const user = await Users.findOne({ email: profile._json.email }).populate('cartId').lean();
            if (user) {
                return done(null, user);
            }

            const newCart = await Cart.create({ products: [] });
            const fullName = profile._json.name;
            const firstName = fullName.substring(0, fullName.lastIndexOf(' '));
            const lastName = fullName.substring(fullName.lastIndexOf(' ') + 1);
            const newUser = {
                firstName,
                lastName,
                age: 30,
                email: profile._json.email,
                password: '',
                cartId: newCart._id 
            };
            const result = await Users.create(newUser).lean();
            done(null, result);
        }
        catch (err) {
            done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        console.log('Serialized: ', user);
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        console.log('Deserialized: ', id);
        const user = await Users.findById(id);
        done(null, user);
    });
};

module.exports = initializeStrategy;
