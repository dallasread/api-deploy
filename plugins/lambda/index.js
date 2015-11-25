var Plugin = require('../../lib/plugin'),
    AWS = require('aws-sdk');

var Lambda = module.exports = Plugin.create({
    name: 'lambda',
    defaults: {
        lambda: {
            memorySize: 128,
            role: null,
            timeout: 60,
            runtime: 'nodejs'
        },
        sdk: {
            template: __dirname + '/templates/sdk.hbs'
        },
        aws: {}
    },
    cli: [
        // ['r', 'routes[=ARG+]', 'Set the routes you wish to deploy']
    ],
    deployAPI: function deployAPI(args, options, done) {
        this.deployLambdas(args, options, done);
    },
    afterConfigure: function afterConfigure() {
        var _ = this;

        AWS.config.update(_.aws);

        if (_.aws.profile) {
            AWS.config.credentials = new AWS.SharedIniFileCredentials({
                profile: _.aws.profile
            });

            _.aws.secretAccessKey = AWS.config.credentials.secretAccessKey;
            _.aws.accessKeyId = AWS.config.credentials.accessKeyId;
            _.aws.region = AWS.config.region;
        }

        _.defineProperties({
            writable: true
        }, {
            AWSLambda: new AWS.Lambda()
        });

        return _;
    }
});

Lambda.defineProperties(require('./deploy'));
