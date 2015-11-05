var async = require('async'),
    AWSRequest = require('../utils/aws-request');

function getMethodID(method) {
    return method && method.data &&
        method.data['x-amazon-apigateway-integration'] &&
        method.data['x-amazon-apigateway-integration'].uri;
}

module.exports = {
    deployRestAPIMethods: function deployRestAPIMethods(done) {
        var _ = this;

        async.eachSeries(_.methods, function(method, done) {
            _.deployRestAPIMethod(method, done);
        }, done);
    },

    deployRestAPIMethod: function deployRestAPIMethod(method, done) {
        var _ = this;

        if (getMethodID(method)) {
            _.updateRestAPIMethod(method, done);
        } else {
            _.createRestAPIMethod(method, done);
        }
    },

    createRestAPIMethod: function createRestAPIMethod(method, done) {
        var _ = this,
            integration = method.data['x-amazon-apigateway-integration'];

        _.logger.log('Creating Method                - ' + method._path + ' (' + method._method + ')');

        AWSRequest({
            path: '/restapis/' + _.swagger.data['x-amazon-apigateway-restapi'].id +
                '/resources/' + method._resource.data['x-amazon-apigateway-resource'].id +
                '/methods/' + method._method,
            method: 'PUT',
            body: {
                authorizationType: method.data['x-amazon-apigateway-auth'].type,
                apiKeyRequired: integration.apiKeyRequired,
                requestParameters: integration.requestParameters,
                requestModels: integration.requestModels
            }
        }, function(err, newMethod) {
            if (err) return done(err);

            _.logger.log('Created Method                 - ' + method._path + ' (' + method._method + ')');

            _.createRestAPIMethodResponse(method, function() {
                _.deployRestAPIAccessPolicy(method, function() {
                    done();
                });
            });
        });
    },

    updateRestAPIMethod: function updateRestAPIMethod(method, done) {
        var _ = this;

        _.logger.log('Updating Method                - ' + method._path + ' (' + method._method + ')');
        _.logger.log('Updated Method                 - ' + method._path + ' (' + method._method + ')');

        done();
    },

    createRestAPIMethodResponse: function createRestAPIMethodResponse(method, done) {
        var _ = this,
            integration = method.data['x-amazon-apigateway-integration'];

        _.logger.log('Creating Method Response       - ' + method._path + ' (' + method._method + ')');

        AWSRequest({
            path: '/restapis/' + _.swagger.data['x-amazon-apigateway-restapi'].id +
                '/resources/' + method._resource.data['x-amazon-apigateway-resource'].id +
                '/methods/' + method._method +
                '/responses/200',
            method: 'PUT',
            body: {
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Origin': true
                },
                responseModels: {
                    'application/json': 'Empty'
                }
            }
        }, function(err, int) {
            if (err) return done(err);

            AWSRequest({
                path: '/restapis/' + _.swagger.data['x-amazon-apigateway-restapi'].id +
                    '/resources/' + method._resource.data['x-amazon-apigateway-resource'].id +
                    '/methods/' + method._method +
                    '/responses/400',
                method: 'PUT',
                body: {
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                        'method.response.header.Access-Control-Allow-Origin': true
                    },
                    responseModels: {
                        'application/json': 'Empty'
                    }
                }
            }, function(err, integration) {
                if (err) return done(err);

                _.logger.log('Created Method Response        - ' + method._path + ' (' + method._method + ')');

                done();
            });
        });
    }
};
