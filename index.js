var Generator = require('generate-js'),
    AWS = require('aws-sdk'),
    Utils = require('./lib/utils'),
    handlebars = Utils.handlebars,
    merge = require('deepmerge'),
    fs = require('fs');

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

    _.defaults.aws.secretAccessKey = AWS.config.credentials.secretAccessKey;
    _.defaults.aws.accessKeyId = AWS.config.credentials.accessKeyId;
    _.defaults.aws.region = AWS.config.region;

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
        js: fs.readFileSync(__dirname + '/lib/sdk/templates/js/rest-api.hbs', { encoding: 'utf8' })
    }, _.sdk.templates || {});
});

APIDeploy.definePrototype(require('./lib/sdk/generate'));
APIDeploy.definePrototype(require('./lib/swagger/generate'));
APIDeploy.definePrototype(require('./lib/deploy'));
APIDeploy.definePrototype(require('./lib/methods/find'));
APIDeploy.definePrototype(require('./lib/tasks/register'));

APIDeploy.definePrototype(require('./lib/lambdas/deploy'));

APIDeploy.definePrototype(require('./lib/api-gateway/rest-api'));
APIDeploy.definePrototype(require('./lib/api-gateway/resources'));
APIDeploy.definePrototype(require('./lib/api-gateway/methods'));
APIDeploy.definePrototype(require('./lib/api-gateway/access-policies'));
APIDeploy.definePrototype(require('./lib/api-gateway/integrations'));
APIDeploy.definePrototype(require('./lib/api-gateway/deployments'));

APIDeploy.definePrototype(require('./lib/utils/aws-request'));

module.exports = APIDeploy;
