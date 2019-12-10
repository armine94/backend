const log4js = require('log4js');
const settings = require('../configs/envSettings.json');
const logLevel = process.argv[2] === settings.workingMode.prod ? settings.logger.logLevelProd : settings.logger.logLevelDev;

const loggerConfig = () => {
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

module.exports = loggerConfig;