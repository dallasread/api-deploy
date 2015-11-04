var Generator = require('generate-js'),
    AWS = require('aws-sdk'),
    Utils = require('./lib/utils'),
    handlebars = Utils.handlebars,
    merge = require('deepmerge');

var APIDeploy = Generator.generate(function APIDeploy(options) {
    var _ = this;

    _.defineProperties({
        writable: true
    }, {
        logger: options.logger || Utils.logger,
        defaults: merge(
            {
                uglify: {},
                lambda: {
                    memorySize: 128,
                    role: null,
                    timeout: 60,
                    runtime: 'nodejs',
                },
                aws: {
                    region: 'us-east-1'
                }
            },
            options.defaults || {}
        )
    });

    if (_.defaults.aws.profile) {
        AWS.config.credentials = new AWS.SharedIniFileCredentials({
            profile: _.defaults.aws.profile
        });
    }

    AWS.config.update(_.defaults.aws);

    _.defineProperties({
        handlebars: handlebars,
        AWSLambda: new AWS.Lambda()
    });

    delete options.defaults;

    _.defineProperties({
        writable: true,
        enumerable: true
    }, options);

    _.swagger.data = _.readSwagger();

    _.swagger.templates = merge({
        resource: JSON.stringify(
            require('./lib/swagger/templates/resource.json')
        )
    }, _.swagger.templates || {});

    _.sdk.templates = merge({
        js: require('./lib/sdk/templates/js/rest-api.hbs')
    }, _.sdk.templates || {});
});

APIDeploy.definePrototype(require('./lib/sdk/generate'));
APIDeploy.definePrototype(require('./lib/swagger/generate'));
APIDeploy.definePrototype(require('./lib/deploy'));
APIDeploy.definePrototype(require('./lib/methods/get'));
APIDeploy.definePrototype(require('./lib/tasks/register'));

APIDeploy.definePrototype(require('./lib/lambdas/deploy'));

APIDeploy.definePrototype(require('./lib/api-gateway/rest-api'));
APIDeploy.definePrototype(require('./lib/api-gateway/rest-api/resources'));
APIDeploy.definePrototype(require('./lib/api-gateway/rest-api/methods'));
APIDeploy.definePrototype(require('./lib/api-gateway/rest-api/integrations'));
APIDeploy.definePrototype(require('./lib/api-gateway/rest-api/deployments'));

module.exports = APIDeploy;
