var Plugin = require('../../lib/plugin'),
    AWS = require('aws-sdk'),
    fs = require('fs');

var apigateway = module.exports = Plugin.create({
    name: 'apigateway',
    requires: ['lambda'],
    defaults: {
        aws: {},
        apigateway: {
            cors: true,
            method: {
                type: 'AWS',
                httpMethod: 'POST',
                authorizationType: 'NONE',
                apiKeyRequired: false,
                requestModels: {},
                requestParameters: {}
            }
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

        var corsObj = JSON.parse(JSON.stringify(_.defaults.apigateway.method));

        corsObj.type = 'MOCK';
        corsObj.requestTemplates = {
            'application/json': {
                statusCode: 200
            }
        };

        delete corsObj.httpMethod;

        for (i = 0; i < resourceNames.length; i++) {
            _.APIDeploy.swagger.data.paths[resourceNames[i]] = {
                options: {
                    'x-apigateway': corsObj
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
