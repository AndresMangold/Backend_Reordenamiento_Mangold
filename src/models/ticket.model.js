const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
    },

    purchase_datetime: {
        type: Date,
        default: Date.now,
    },
    amount: Number,
    purchaser: String,
});

module.exports = mongoose.model('Tickets', schema, 'tickets');