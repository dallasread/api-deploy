var Plugin = require('../../lib/plugin'),
    AWS = require('aws-sdk');

var apigateway = module.exports = Plugin.create({
    name: 'apigateway',
    defaults: {
        aws: {}
    },
    swagger: {
        template: JSON.stringify({
            'type': '{{apigateway.type}}',
            'apiKeyRequired': false,
            'httpMethod': 'POST',
            'cacheNamespace': null,
            'cacheKeyParameters': [],
            'credentials': null
        })
    },
    cli: [
        // ['r', 'routes[=ARG+]', 'Set the routes you wish to deploy']
    ],
    deployAPI: function deployAPI(args, options, done) {
        this.deployAPIGateway(args, options, done);
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

        return _;
    }
});

apigateway.defineProperties(require('./deploy'));
apigateway.defineProperties(require('./rest-api'));
apigateway.defineProperties(require('./deployment'));
apigateway.defineProperties(require('./resource'));
apigateway.defineProperties(require('./method'));
apigateway.defineProperties(require('./method-details'));
apigateway.defineProperties(require('./integration-details'));
apigateway.defineProperties(require('./aws-request'));
