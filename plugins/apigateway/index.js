var Plugin = require('../../lib/plugin'),
    AWS = require('aws-sdk');

var apigateway = module.exports = Plugin.create({
    name: 'apigateway',
    defaults: {
        sdk: {
            path: './sdk.js'
        },
        aws: {}
    },
    cli: [
        ['s', 'stage[=ARG]', 'Set the stage to deploy']
    ],
    deployAPI: function deployAPI(args, options, done) {
        this.deployRestAPI(args, options, done);
    },
    afterConfigure: function afterConfigure() {
        var _ = this;

        AWS.config.update(_.aws);

        if (_.aws.profile) {
            AWS.config.credentials = new AWS.SharedIniFileCredentials({
                profile: _.aws.profile
            });
        }

        _.aws.secretAccessKey = AWS.config.credentials.secretAccessKey;
        _.aws.accessKeyId = AWS.config.credentials.accessKeyId;
        _.aws.region = AWS.config.region;

        _.defineProperties({
            writable: true
        }, {
            AWSLambda: new AWS.Lambda()
        });

        return _;
    }
});

apigateway.defineProperties(require('./access-policies'));
apigateway.defineProperties(require('./deployments'));
apigateway.defineProperties(require('./integrations'));
apigateway.defineProperties(require('./methods'));
apigateway.defineProperties(require('./resources'));
apigateway.defineProperties(require('./rest-api'));
