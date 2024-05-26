const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    products: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product' },
            title: { type: String },
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true });

cartSchema.virtual('id').get(function () {
    return this._id.toString();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
