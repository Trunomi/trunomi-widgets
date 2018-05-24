var devConfig = require('./webpack-dev.config');
var productionConfig = require('./webpack-production.config');

module.exports = function(env) {
    if(env && (env.dev || env.demo)) {
        return devConfig
    }
    else {
        return productionConfig
    }
}