const cors = require('cors');
const express = require('express');
const router = require('./routes/route');
const loggerConfig = require('./log/log4js');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDB = require('./databases/mongodb');
const checkUser = require('./middlwares/middlware');
const corsHaeder = require('./middlwares/corsMiddl');
const settings = require('./configs/envSettings.json');
const MongoDBStore = require('connect-mongodb-session')(session);

const allowedOrigins = process.argv[2] === settings.workingMode.prod ? settings.cors.urlProd : settings.cors.urlDev;
const store = new MongoDBStore({
    uri: settings.db.DB + settings.db.IP + ':' + settings.db.PORT+ '/' + settings.db.DATABASES, 
    collection: settings.db.COLLECTION
});

connectDB().then( () => {
    loggerConfig();
    app.listen(settings.server.port);
    console.log("Server Run On", settings.server.port, " Port");
});

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/',corsHaeder.all);

app.use(session({
    key: settings.session.key,
    secret: settings.session.secret,
    resave: settings.session.resave,
    saveUninitialized: settings.session.saveUninitialized,
    store: store,
    cookie: {
        maxAge: settings.session.maxAge,
        httpOnly: settings.session.httpOnly,
    },
}));

app.use((req, res, next) => {
    if (req.cookies && !req.session) {
        res.clearCookie(settings.session.key);
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