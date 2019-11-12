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
    description: {
        type: String,
    },
    filename: {
        type: String
    }
});

const Image = mongoose.model('images', ImageSchema);

module.exports = Image;
