const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    surname: {
        type: String,
        required: true
    },

    gender: {
        type: String
    },

    bDay: {
        type: String
    },

    imageUrl: {
        type: String
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('users', UserSchema);

module.exports = User;