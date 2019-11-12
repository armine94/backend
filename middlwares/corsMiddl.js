const url = require('../configs/cors.config')

module.exports = {
    all: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', url);
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    }
}