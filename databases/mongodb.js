const mongoose = require('mongoose');
const settings = require('../configs/envSettings.json');

const connectDB = () => {
  return mongoose.connect(settings.db.DB + settings.db.IP + ':' + settings.db.PORT+ '/' + settings.db.DATABASES, { useNewUrlParser: true , useUnifiedTopology: true });
};

module.exports =  connectDB;