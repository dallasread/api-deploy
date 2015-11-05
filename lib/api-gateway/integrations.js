var AWSRequest = require('../utils/aws-request'),
    async = require('async');

function getMethodID(method) {
    return method && method.data &&
        method.data['x-amazon-apigateway-integration'] &&
        method.data['x-amazon-apigateway-integration'].uri;
}

module.exports = {
    deployRestAPIIntegrations: function deployRestAPIIntegrations(done) {
        var _ = this;

        _.findMethods();

        async.each(_.methods, function(method, done) {
            _.deployRestAPIIntegration(method, done);
        }, done);
    },

    deployRestAPIIntegration: function deployRestAPIIntegration(method, done) {
        var _ = this;

        if (getMethodID(method)) {
            _.updateRestAPIIntegration(method, done);
        } else {
            _.createRestAPIIntegration(method, done);
        }
    },

    createRestAPIIntegration: function createRestAPIIntegration(method, done) {
        var _ = this,
            integration = method.data['x-amazon-apigateway-integration'],
            body = {
                type: integration.type,
                requestTemplates: {},
                requestModels: integration.requestModels
            },
            key, val;

        for (key in integration.requestTemplates) {
            val = integration.requestTemplates[key];
            body.requestTemplates[key] = typeof val === 'object' ? JSON.stringify(val, null, 4) : null;
        }

        if (method.data['x-amazon-lambda']) {
            body.httpMethod = integration.httpMethod;
            body.uri = 'arn:aws:apigateway:' +
                _.defaults.aws.region +
                ':lambda:path/2015-03-31/functions/' +
                method.data['x-amazon-lambda'].arn +
                '/invocations';

            // body.credentials = _.defaults.lambda.role;
        }

        _.logger.log('Creating Integration           - ' + method._path + ' (' + method._method + ')');

        AWSRequest({
            path: '/restapis/' + _.swagger.data['x-amazon-apigateway-restapi'].id +
                '/resources/' + method._resource.data['x-amazon-apigateway-resource'].id +
                '/methods/' + method._method +
                '/integration',
            method: 'PUT',
            body: body
        }, function(err, integration) {
            if (err) return done(err);

            method.data['x-amazon-apigateway-integration'].uri = integration.uri;

            _.createRestAPIIntegrationResponse(method, function() {
                _.logger.log('Created Integration            - ' + method._path + ' (' + method._method + ')');
                done();
            });
        });
    },

    updateRestAPIIntegration: function updateRestAPIIntegration(method, done) {
        var _ = this;

        _.logger.log('Updating Integration           - ' + method._path + ' (' + method._method + ')');
        _.logger.log('Updated Integration            - ' + method._path + ' (' + method._method + ')');

        done();
    },

    createRestAPIIntegrationResponse: function createRestAPIIntegrationResponse(method, done) {
        var _ = this,
            integration = method.data['x-amazon-apigateway-integration'],
            responseTemplates = {},
            key, val;

        for (key in integration.responseTemplates) {
            val = integration.responseTemplates[key];
            responseTemplates[key] = typeof val === 'object' ? JSON.stringify(val, null, 4) : null;
        }

        _.logger.log('Creating Integration Response  - ' + method._path + ' (' + method._method + ')');

        AWSRequest({
            path: '/restapis/' + _.swagger.data['x-amazon-apigateway-restapi'].id +
                '/resources/' + method._resource.data['x-amazon-apigateway-resource'].id +
                '/methods/' + method._method +
                '/integration/responses/200',
            method: 'PUT',
            body: {
                // selectionPattern: 'String',
                responseParameters: integration.responses['200'].responseParameters || {},
                responseTemplates: responseTemplates
            }
        }, function(err, integration) {
            if (err) return done(err);

            _.logger.log('Created Integration Response   - ' + method._path + ' (' + method._method + ')');

            done();
        });
    }
};
