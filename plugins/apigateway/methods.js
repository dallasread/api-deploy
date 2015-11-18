var async = require('async');

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
            integration = method.data['x-amazon-apigateway-integration'],
            body = {
                authorizationType: 'NONE',
                apiKeyRequired: integration.apiKeyRequired,
                requestParameters: {},
                requestTemplates: {},
                requestModels: {}
            },
            key, val;

        for (key in integration.requestTemplates) {
            val = integration.requestTemplates[key];
            if (typeof val === 'object') body.requestTemplates[key] = JSON.stringify(val, null, 4);
        }

        for (key in integration.requestParameters) {
            body.requestParameters[key] = integration.requestParameters[key];
        }

        for (key in integration.requestModels) {
            body.requestModels[key] = integration.requestModels[key];
        }

        _.APIDeploy.logger.log('Creating Method                - ' + method._path + ' (' + method._method + ')');

        _.AWSRequest({
            path: '/restapis/' + _.APIDeploy.swagger.data['x-amazon-apigateway-restapi'].id +
                '/resources/' + method._resource.data['x-amazon-apigateway-resource'].id +
                '/methods/' + method._method,
            method: 'PUT',
            body: body
        }, function(err, newMethod) {
            if (err) return done(err);

            _.APIDeploy.logger.log('Created Method                 - ' + method._path + ' (' + method._method + ')');

            _.createRestAPIMethodResponse(method, function() {
                _.deployRestAPIAccessPolicy(method, function() {
                    done();
                });
            });
        });
    },

    updateRestAPIMethod: function updateRestAPIMethod(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Updating Method                - ' + method._path + ' (' + method._method + ')');
        _.APIDeploy.logger.log('Updated Method                 - ' + method._path + ' (' + method._method + ')');

        done();
    },

    createRestAPIMethodResponse: function createRestAPIMethodResponse(method, done) {
        var _ = this,
            integration = method.data['x-amazon-apigateway-integration'],
            responseParameters = {},
            responseTemplates = {},
            val, key;

        for (key in integration.responses['200'].responseParameters) {
            responseParameters[key] = true;
        }

        for (key in integration.responses['200'].responseTemplates) {
            val = integration.responses['200'].responseTemplates[key];
            responseTemplates[key] = val && typeof val === 'object' ? JSON.stringify(val, null, 4) : null;
        }

        _.APIDeploy.logger.log('Creating Method Response       - ' + method._path + ' (' + method._method + ')');

        _.AWSRequest({
            path: '/restapis/' + _.APIDeploy.swagger.data['x-amazon-apigateway-restapi'].id +
                '/resources/' + method._resource.data['x-amazon-apigateway-resource'].id +
                '/methods/' + method._method +
                '/responses/200',
            method: 'PUT',
            body: {
                responseParameters: responseParameters,
                responseTemplates: responseTemplates,
                responseModels: integration.responses['200'].responseModels || {}
            }
        }, function(err, int) {
            if (err) return done(err);

            _.APIDeploy.logger.log('Created Method Response        - ' + method._path + ' (' + method._method + ')');

            done();
        });
    }
};
