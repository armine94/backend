const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDb = require('./databases/mongodb');
const checkUser = require('./middlwares/middlware')
const port = require('./configs/server.config');
const configLog = require('./log/log4js');
const router = require('./routes/route')
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/asset',
    collection: 'session'
});

store.on('error', function (error) {
    console.log(error);
});

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/users/login',session({
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 5  //5 hour
    },
}));

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
app.use('/', function (req, res, next) {
    console.log(req);

   if(req.headers.origin === "http://localhost:5000") {
        console.log("aaa");
        
        res.setHeader('Access-Control-Allow-Origin', "http://localhost:5000");
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    } else if(req.headers.host === "http://localhost:3000") {
        res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    }
});

app.use('/upload', checkUser.all)

app.use('/', router);
app.use('/static', express.static(__dirname + '/public'));
connectDb().then( () => {
    configLog();
    
   });
console.log("Server Run On ", port, " Port");
app.listen(port);
