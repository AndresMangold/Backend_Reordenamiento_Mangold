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
            let user = await Users.findOne({ email: profile._json.email }).populate('cartId').lean();
            if (!user) {
                const newCart = await Cart.create({ products: [] });
                const fullName = profile._json.name || profile._json.login;
                const [firstName, ...lastNameParts] = fullName.split(' ');
                const lastName = lastNameParts.join(' ');
                user = {
                    firstName,
                    lastName,
                    age: 30,
                    email: profile._json.email,
                    password: '',
                    role: 'user',
                    cartId: newCart._id
                };
                user = await Users.create(user);
            }
            done(null, user);
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
        const user = await Users.findById(id).populate('cartId');
        done(null, user);
    });
};

module.exports = initializeStrategy;
