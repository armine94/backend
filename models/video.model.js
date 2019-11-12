const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const VideoSchema = new Schema({
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
    },
    imgUrl: {
        type: String,
    },
    description: {
        type: String,
    }
});

const Video = mongoose.model('videos', VideoSchema);

module.exports = Video;
