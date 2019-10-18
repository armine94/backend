const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AudioSchema = new Schema({
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

const Audio = mongoose.model('audios', AudioSchema);

module.exports = Audio;
