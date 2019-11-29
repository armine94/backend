const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    description: {
        type: String,
    },

    imageUrl: {
        type: String
    },

    metadata: {
        SourceFile: String,
        FileName: String,
        Directory: String,
        FileSize: String,
        FilePermissions: String,
        FileTypeExtension: String,
        ImageWidth: String,
        ImageHeight: String,
        ImageSize: String,
        Megapixels: String,
    },
});

const Image = mongoose.model('images', ImageSchema);

module.exports = Image;