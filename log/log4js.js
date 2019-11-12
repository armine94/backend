const log4js = require('log4js');
const logLevel = require('../configs/log.config');

const configLog = () => {
    return log4js.configure({
        appenders: {
            console: { type: 'console' },
        },
        categories: {
            default: { appenders: ['console'], level: logLevel },
            logger: { appenders: ['console'], level: logLevel }
        }
    });
}

module.exports = configLog;