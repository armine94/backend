const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StoreSchema = new Schema({
    _id: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    session: {
sessionID : {
    type: String
}
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const Store = mongoose.model('session', StoreSchema);

module.exports = Store;
