const mongoose = require("mongoose");
const Schema = mongoose.Schema


const productSchema = new Schema({

    title: { type: "string", required: true },
    price: { type: "string", required: true },
    description: { type: "string", required: true },
	pictureUrl: { type: "string", required: true },
	pictureUrlArray: { type: "array", required: false },
	newProduct: { type: "string", required: true },
	gender: { type: "string", required: true },

});

const product = mongoose.model('Product', productSchema);
module.exports = product;
