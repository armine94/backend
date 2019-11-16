const log4js = require('log4js');
const logger = log4js.getLogger('logger');
const MongoClient = require('mongodb').MongoClient;
const settings = require('../configs/envSettings.json');

module.exports = {
    all: async function (req, res, next) {
        if (req.session && req.cookies[settings.session.key]) {
            MongoClient.connect(settings.db.DB + settings.db.IP + ':' + settings.db.PORT, { useNewUrlParser: true, useUnifiedTopology: true } ,function (err, db) {
                if (err) throw err;
                const dbo = db.db(settings.db.DATABASES);
                dbo.collection(settings.db.COLLECTION).findOne({ '_id': req.sessionID }, function (err, result) {
                    if (err) throw err;
                    try {
                        if (result.expires > Date.now()) {
                            logger.info('check user -> OK');
                            db.close();
                            next();
                        } else {
                            logger.error(req.session);
                            logger.error(req.cookies[settings.session.key]);
                            logger.error('status: 403');
                            db.close();
                            res.status(403).end();
                        }
                    } catch (error) {
                        logger.error(error);
                        logger.error(req.session);
                        logger.error(req.cookies[settings.session.key]);
                        logger.error('status: 403');
                        db.close();
                        res.status(403).end();
                    }
                    db.close();
                });
            });
        } else {
            logger.error(req.session);
            logger.error(req.cookies[settings.session.key]);
            logger.error('status: 403');
            res.status(403).end();
        }
    }
} 