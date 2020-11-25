const mongoose = require("mongoose");
const Schema = mongoose.Schema


const ordersSchema = new Schema({

	id : { type: "string", required: true },
    name: { type: "string", required: true },
    address: { type: "string", required: true },
    phoneNumber: { type: "string", required: true },

});

const order = mongoose.model('Order', ordersSchema);
module.exports = order; 