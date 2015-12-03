var async = require('async'),
    findPatchOperations = require('../../utils/find-patch-operations.js');

function isDeployed(method, status) {
    var responses = method.oldData &&
        method.oldData._embedded &&
        method.oldData._embedded['method:responses'];

    if (!responses) return false;
    if (!(responses instanceof Array)) responses = [responses];

    for (var i = responses.length - 1; i >= 0; i--) {
        if (responses[i].statusCode === status) {
            return responses[i];
        }
    }

    return false;
}

module.exports = {
    deployIntegrationResponses: function deployIntegrationResponses(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Integration Responses:', method.pathInfo);

        async.forEachOfSeries(method.responses, function deployEachIntegrationResponse(response, status, next) {
            _.deployIntegrationResponse(method, status, next);
        }, function(err, data) {
            _.APIDeploy.logger.succeed('Deployed Integration Responses:', method.pathInfo);

            done(null, method);
        });
    },

    deployIntegrationResponse: function deployIntegrationResponse(method, status, done) {
        var _ = this,
            funcs = [];

        _.APIDeploy.logger.succeed('Deploying Integration Response:', method.pathInfo, '(' + status + ')');

        var exists = isDeployed(method, status);

        if (!exists) {
            funcs.push(function createIntegrationResponse(next) {
                _.createIntegrationResponse(method, status, next);
            });
        }

        funcs.push(function updateIntegrationResponse(next) {
            var patchOperations = findPatchOperations(
                    exists,
                    method.responses[status]['x-apigateway'],
                    [],
                    [
                        'responseParameters^=integration.response',
                        'responseModels'
                    ]
                );

            if (patchOperations.length) {
                _.updateIntegrationResponse(method, status, patchOperations, next);
            } else {
                next();
            }
        });

        async.series(funcs, function(err, data) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Deployed Integration Response:', method.pathInfo, '(' + status + ')');
            }

            done(null, method);
        });
    },

    createIntegrationResponse: function createIntegrationResponse(method, status, done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating Integration Response:', method.pathInfo, '(' + status + ')');

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/integration/responses/' + status,
            method: 'PUT',
            body: {
                selectionPattern: ''
            }
        }, function(err, methodResponses) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Created Integration Response:', method.pathInfo, '(' + status + ')');
            }

            done(null, methodResponses);
        });
    },

    updateIntegrationResponse: function updateIntegrationResponse(method, status, patchOperations, done) {
        var _ = this;

        if (!patchOperations.length) return done();

        _.APIDeploy.logger.log('Updating Integration Response:', method.pathInfo, '(' + status + ')');

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/integration',
            method: 'PATCH',
            body: {
                patchOperations: patchOperations
            }
        }, function(err, methodResponses) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Updated Integration Response:', method.pathInfo, '(' + status + ')');
            }

            done(null, methodResponses);
        });

    },
};
