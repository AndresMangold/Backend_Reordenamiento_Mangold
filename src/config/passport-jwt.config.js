const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport'); 
const User = require('../models/user.model');
const cookieExtractor = require('../utils/cookieExtractor');
require('dotenv').config();

const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET,
};

const initializePassportJWT = () => {
    passport.use('jwt', new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.user._id).populate('cartId');
            if (!user) {
                return done(null, false, { message: 'Token inválido' });
            }
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }));
};

module.exports = initializePassportJWT;
