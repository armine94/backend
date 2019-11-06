const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = "debug";

module.exports = {
    all: function (req, res, next) {
        console.log(req);
        
       /* if (req.session && req.cookies["connect.sid"]) {
            logger.info('check user -> OK');
            next();
        } else {
            logger.error(req.session);
            logger.error(req.cookies["connect.sid"]);
            logger.error('status: 403');
            res.status(403).end();
        }*/ next();
    }
} 
