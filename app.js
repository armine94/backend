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
const port = require('./config.js');
app.use(cors('*'));
app.use(passport.initialize());
require('./passport')(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "http://localhost:8080");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/users', users);
app.use('/upload/', images);
app.use('/upload/', text);
app.use('/upload/', audio);
app.use('/static', express.static(__dirname + '/public'));

console.log("Server Run On ", port, " Port");
app.listen(port);
