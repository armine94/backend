const cors = require('cors');
const express = require('express');
const router = require('./routes/route');
const configLog = require('./log/log4js');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const port = require('./configs/server.config');
const connectDb = require('./databases/mongodb');
const checkUser = require('./middlwares/middlware');
const corsHaeder = require('./middlwares/corsMiddl');
const dbConfig = require('./configs/mongodb.config');
const allowedOrigins = require('./configs/cors.config');
const sessionConfig = require('./configs/session.config');
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: dbConfig.DB + dbConfig.IP + ':' + dbConfig.PORT+ '/' + dbConfig.DATABASES, 
    collection: dbConfig.COLLECTION
});

connectDb().then( () => {
    configLog();
});

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/',corsHaeder.all);

app.use(session({
    name: sessionConfig.name,
    secret: sessionConfig.secret,
    resave: sessionConfig.resave,
    saveUninitialized: sessionConfig.saveUninitialized,
    store: store,
    cookie: {
        maxAge: sessionConfig.maxAge,
        httpOnly: sessionConfig.httpOnly,
    },
}));

app.use((req, res, next) => {
    if (req.cookies && !req.session) {
        res.clearCookie(sessionConfig.name);
    }
    next();
});

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
}));

app.use('/upload', checkUser.all)

app.use('/', router);
app.use('/static', express.static(__dirname + '/public'));
app.listen(port);
console.log("Server Run On", port, " Port");
