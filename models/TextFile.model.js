const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TextFileSchema = new Schema({
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
        SourceFile: String,
        FileName: String,
        Directory: String,
        FileSize: String,
        FilePermissions: String,
        FileTypeExtension: String,
    },
    description: {
        type: String,
    }
});

const TextFile = mongoose.model('texts', TextFileSchema);

module.exports = TextFile;
