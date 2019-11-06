const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StoreSchema = new Schema({
    session: {
        email: {
            type:String,
        }
    }
});

const Store = mongoose.model('sessions', StoreSchema);

module.exports = Store;