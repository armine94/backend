const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    src: {
	type: String,
	required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    metadata: {
	type: String
    }
});

const Image = mongoose.model('images', ImageSchema);

module.exports = Image;
