const mongoose = require('mongoose');
const { Schema } = mongoose; 

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    age: Number,
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    role: { 
        type: String,
        default: 'user', 
    },
    cartId: { 
        type: Schema.Types.ObjectId, ref: 'Cart', 
    }
});

module.exports = mongoose.model('User', userSchema, 'users');
