const cors = require('cors');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('./configs/mongodb');
const port = require('./configs/config');
const router = require('./routes/route')

app = express();
app.use(passport.initialize());
require('./passport')(passport);
app.use(cors('*'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(session({
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/upload/images',
        expires: 1000 * 60 * 60 * 5  //5 hour
    }
}));

app.use((req, res, next) => {
    if (req.cookies && !req.session) {
        res.clearCookie('connect.sid');     
    }
    next();
});

app.use('/', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "http://localhost:8080");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/', router);
app.use('/static', express.static(__dirname + '/public'));
console.log("Server Run On ", port, " Port");
app.listen(port);
