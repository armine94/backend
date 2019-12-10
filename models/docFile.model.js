const settings = require('../configs/envSettings.json');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocFileSchema = new Schema({
    author: {
        type: String
    },
    
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
        default: settings.staticPath.docImage,
    },

    docUrl: {
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

const DocFile = mongoose.model('docs', DocFileSchema);

module.exports = DocFile;