var Plugin = require('../../lib/plugin'),
    AWS = require('aws-sdk'),
    fs = require('fs');

var apigateway = module.exports = Plugin.create({
    name: 'apigateway',
    defaults: {
        aws: {},
        apigateway: {
            cors: true,
            type: 'AWS',
            authorizationType: 'NONE',
            apiKeyRequired: false,
            httpMethod: 'POST',
            cacheNamespace: null,
            cacheKeyParameters: [],
            credentials: null
        }
    },
    swagger: {
        template: fs.readFileSync(__dirname + '/templates/swagger.json', { encoding: 'utf8' })
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
    },

    beforeSwagger: function beforeSwagger(resourceNames) {
        var _ = this,
            i;

        if (!_.apigateway.cors) return;

        for (i = 0; i < resourceNames.length; i++) {
            _.APIDeploy.swagger.data.paths[resourceNames[i]] = {
                options: {
                    'x-apigateway': {
                        type: 'MOCK',
                        authorizationType: 'NONE',
                        apiKeyRequired: false,
                        httpMethod: 'POST',
                        cacheNamespace: null,
                        cacheKeyParameters: [],
                        credentials: null
                    }
                }
            };
        }
    },
});

apigateway.defineProperties(require('./deploy'));
apigateway.defineProperties(require('./rest-api'));
apigateway.defineProperties(require('./deployment'));
apigateway.defineProperties(require('./resource'));
apigateway.defineProperties(require('./method'));
apigateway.defineProperties(require('./method-details'));
apigateway.defineProperties(require('./integration-details'));
apigateway.defineProperties(require('./aws-request'));
