const mongoose = require('mongoose');
const config = require('../configs/mongodb.config')

const connectDb = () => {
  return mongoose.connect(config.DB + config.IP + ':' + config.PORT+ '/' + config.DATABASES, { useNewUrlParser: true ,useUnifiedTopology: true });
};

module.exports =  connectDb ;