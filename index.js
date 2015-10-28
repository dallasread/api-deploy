var Generator = require('generate-js'),
    Utils = require('./lib/utils');

var APIDeploy = Generator.generate(function APIDeploy(configPath) {
    var _ = this;
    _.config(configPath);
    _.logger = Utils.logger;
});

APIDeploy.definePrototype(require('./lib/config'));
APIDeploy.definePrototype(require('./lib/lambda'));
APIDeploy.definePrototype(require('./lib/deploy'));
APIDeploy.definePrototype(require('./lib/sdk'));

module.exports = APIDeploy;
