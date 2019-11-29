const log4js = require('log4js');
const logger = log4js.getLogger('logger');
const MongoClient = require('mongodb').MongoClient;
const settings = require('../configs/envSettings.json');
const Cookies = require('universal-cookie');

module.exports = {
    all: function (req, res, next) {
        const cookies = new Cookies(req.headers.cookie);
        if (cookies.get(settings.session.name)) {            
            MongoClient.connect(settings.db.DB + settings.db.IP + ':' + settings.db.PORT, { useNewUrlParser: true, useUnifiedTopology: true } ,function (err, db) {
                if (err) {
                    logger.error("middlWare.js - line: 13", err);
                    res.status(403).end();
                }
                const dbo = db.db(settings.db.DATABASES);
                const id = cookies.get(settings.session.name).slice(2,34);
                dbo.collection(settings.db.COLLECTION).findOne({ _id: id }, function (err, result) {
                    if (err) {
                        logger.error("middlWare.js - line: 20", err);
                        res.status(403).end();
                    }
                    try {
                        if (result.expires > Date.now()) {
                            logger.info('middlWare.js - line: 25: check user -> OK');
                            db.close();
                            next();
                        } else {
                            logger.error("middlWare.js - line: 29:", req.session);
                            logger.error("middlWare.js - line: 30:", req.cookies[settings.session.key]);
                            logger.error('middlWare.js - line: 31: status: 403');
                            db.close();
                            res.status(403).end();
                        }
                    } catch (error) {
                        logger.error("middlWare.js - line: 36:", error);
                        logger.error("middlWare.js - line: 37:", req.session);
                        logger.error("middlWare.js - line: 38:", req.cookies[settings.session.key]);
                        logger.error("middlWare.js - line: 39: status: 403");
                        db.close();
                        res.status(403).end();
                    }
                    db.close();
                });
            });
        } else {
            logger.error("middlWare.js - line: 47:", req.session);
            logger.error("middlWare.js - line: 48:", req.cookies[settings.session.key]);
            logger.error("middlWare.js - line: 49: status: 403");
            res.status(403).end();
        }
    },

    logout: function(req, res, next) {
        const cookies = new Cookies(req.headers.cookie);
        if (cookies.get(settings.session.name)) {  
            MongoClient.connect(settings.db.DB + settings.db.IP + ':' + settings.db.PORT, { useNewUrlParser: true, useUnifiedTopology: true } ,function (err, db) {      
                const dbo = db.db(settings.db.DATABASES);
                const id = cookies.get(settings.session.name).slice(2,34);
                dbo.collection(settings.db.COLLECTION).deleteOne({ _id: id}, function (err, data) {
                    try {
                        if(data.result.ok){
                            logger.info('middlWare.js - line 63: session successfully deleted');
                            next();
                        } else {
                            logger.error("middlWare.js - line 66: session not found");
                            res.status(403).end();
                        }
                    } catch (error) {
                        logger.error("middlWare.js - line 70: ", error);
                        res.status(403).end();
                    }
                })
            })
        } else {
            logger.error("middlWare.js - line 76: Cookie dos not");
            res.status(403).end();
        }
    }
} 