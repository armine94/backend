const mongoose = require('mongoose');
const config = require('../configs/mongodb.config')

const connectDb = () => {
  return mongoose.connect('mongodb://' + config.IP + ':' + config.PORT+ '/' + config.COLLECTION, { useNewUrlParser: true ,useUnifiedTopology: true });
};

module.exports =  connectDb ;