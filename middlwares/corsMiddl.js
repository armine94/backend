const settings = require('../configs/envSettings.json');
const url = process.argv[2] === settings.workingMode.prod ? settings.cors.urlProd : settings.cors.urlDev;

module.exports = {
    all: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', url);
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    }
}