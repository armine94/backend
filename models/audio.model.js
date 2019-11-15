const mongoose = require('mongoose');
const settings = require('../configs/envSettings.json');
const Schema = mongoose.Schema;

const AudioSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    imageUrl: {
        type: String,
        default: settings.staticPath.audioImage,
    },

    audioUrl: {
        type: String
    },

    description: {
        type: String,
    },
    
    metadata: {
        SourceFile: String,
        FileName: String,
        Directory: String,
        FileSize: String,
        FilePermissions: String,
        FileTypeExtension: String,
    }
});

const Audio = mongoose.model('audios', AudioSchema);

module.exports = Audio;