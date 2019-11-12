const log4js = require('log4js');
const logger = log4js.getLogger('logger');
const MongoClient = require('mongodb').MongoClient;
const sessionConf = require('../configs/session.config');
const mongo = require('../configs/mongodb.config');

module.exports = {
    all: async function (req, res, next) {

        logger.info(req.session);
        logger.info(req.sessionID);
        logger.info(req.cookies[sessionConf.key]);

        if (req.session && req.cookies[sessionConf.key]) {
            MongoClient.connect(mongo.DB + mongo.IP + ':' + mongo.PORT, function (err, db) {
                if (err) throw err;
                var dbo = db.db(mongo.DATABASES);
                dbo.collection(mongo.COLLECTION).findOne({ '_id': req.sessionID }, function (err, result) {
                    if (err) throw err;
                    try {
                        if (result.expires > Date.now()) {
                            logger.info('check user -> OK');
                            next();
                        } else {
                            logger.error(req.session);
                            logger.error(req.cookies[sessionConf.key]);
                            logger.error('status: 403');
                            res.status(403).end();;
                        }
                   
                    } catch (error) {
                        logger.error(error)
                    }
                    db.close();
                });
            });
        } else {
            logger.error(req.session);
            logger.error(req.cookies[sessionConf.key]);
            logger.error('status: 403');
            res.status(403).end();
        }
    }
} 
