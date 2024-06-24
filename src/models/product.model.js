const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    thumbnail: {
        type: String,
        default: 'Sin Imagen'
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        default: "admin"
    }
}, { timestamps: true });

productSchema.virtual('id').get(function () {
    return this._id.toString();
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
