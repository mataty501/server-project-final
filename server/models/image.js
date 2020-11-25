const mongoose = require("mongoose");
const Schema = mongoose.Schema


const ImageSchema = new Schema({
    img: {
        data: Buffer,
        contentType: String
    }
}
);
var Image = mongoose.model('Image', ImageSchema);
module.exports = Image; 