var devConfig = require('./webpack-dev.config');
var productionConfig = require('./webpack-production.config');
var demoConfig = require('./webpack-demo.config');

module.exports = function(env) {
    if(env && env.dev) {
        return devConfig
    }
    else if (env && env.demo)
    	return demoConfig
    else {
        return productionConfig
    }
}