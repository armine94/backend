const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();
const cors = require('cors');

mongoose.connect('mongodb://' + "localhost" + ':' + 27017 + '/' + "asset", {
  useNewUrlParser: true
});

const users = require('./routes/user');
const images = require('./routes/image');
const text = require('./routes/text');
const audio = require('./routes/audio');

app.use(cors())
app.use(passport.initialize());
require('./passport')(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/users', users);
app.use('/upload/', images);
app.use('/upload/', text);
app.use('/upload/', audio);

console.log("Server Run");
app.listen(54545);
