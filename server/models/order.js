const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
  name: { type: "string", required: true },
  address: { type: "string", required: true },
  phoneNumber: { type: "string", required: true },
  productID: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const order = mongoose.model("Order", ordersSchema);
module.exports = order;
