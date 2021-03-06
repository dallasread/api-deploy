var Plugin = require('../../lib/plugin'),
    AWS = require('aws-sdk'),
    merge = require('../../utils/merge.js'),
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
                requestParameters: {},
                requestTemplates: {
                    'application/json': fs.readFileSync(__dirname + '/templates/request.json', { encoding: 'utf8' }),
                }
            }
        }
    },
    swagger: {
        template: fs.readFileSync(__dirname + '/templates/swagger.json', { encoding: 'utf8' })
    },
    cli: [
        ['l', 'lambda', 'Deploys associated Lambdas.']
    ],
    deployAPI: function deployAPI(args, options, done) {
        var _ = this;

        if (options.lambda) {
            _.APIDeploy.plugins.lambda._deployAPI(args, options, function nowAPIGateway() {
                _.deployAPIGateway(args, options, done);
            });
        } else {
            _.deployAPIGateway(args, options, done);
        }
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
    },

    beforeSwagger: function beforeSwagger(resourceNames) {
        var _ = this,
            swaggerDataPaths = _.APIDeploy.swagger.data.paths,
            i;

        if (!_.apigateway.cors) return;

        var corsObj = JSON.parse(JSON.stringify(_.defaults.apigateway.method));

        corsObj.type = 'MOCK';
        corsObj.requestTemplates = {
            'application/json': JSON.stringify({
                statusCode: 200
            }, null, 4)
        };

        delete corsObj.httpMethod;

        for (i = 0; i < resourceNames.length; i++) {
            swaggerDataPaths[resourceNames[i]] = {
                options: {
                    'x-apigateway': corsObj
                }
            };
        }
    },

    afterSwagger: function afterSwagger(swaggerData) {
        var _ = this,
            swaggerDataPaths = swaggerData.paths,
            responseParameters = {},
            key, method;

        if (_.apigateway.cors) {
            responseParameters = {
                'method.response.header.Access-Control-Allow-Headers': '\'Content-Type,X-Amz-Date,Authorization\'',
                'method.response.header.Access-Control-Allow-Methods': '\'POST,GET,OPTIONS,PUT,PATCH,DELETE\'',
                'method.response.header.Access-Control-Allow-Origin': '\'*\''
            };
        }

        for (key in swaggerDataPaths) {
            for (method in swaggerDataPaths[key]) {
                if (method.slice(0, 2) !== 'x-') {
                    swaggerDataPaths[key][method] = merge({
                        responses: {
                            200: {
                                'x-apigateway': {
                                    responseParameters: responseParameters,
                                    responseModels: {
                                        'application/json': 'Empty'
                                    },
                                    responseTemplates: {
                                        'application/json': ''
                                    }
                                }
                            }
                        }
                    }, swaggerDataPaths[key][method]);
                }
            }
        }
    },
});

apigateway.defineProperties(require('./deploy'));
apigateway.defineProperties(require('./rest-api'));
apigateway.defineProperties(require('./deployment'));
apigateway.defineProperties(require('./resource'));
apigateway.defineProperties(require('./method'));
apigateway.defineProperties(require('./method-request'));
apigateway.defineProperties(require('./method-response'));
apigateway.defineProperties(require('./integration-request'));
apigateway.defineProperties(require('./integration-response'));
apigateway.defineProperties(require('./lambda-permission'));
apigateway.defineProperties(require('./aws-request'));
