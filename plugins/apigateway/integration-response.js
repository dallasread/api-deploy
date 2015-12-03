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
        var _ = this,
            patchOperations = [];

        _.APIDeploy.logger.log('Deploying Integration Responses:', method.pathInfo);

        async.forEachOfSeries(method.responses, function deployEachIntegrationResponse(response, status, next) {
            var exists = isDeployed(method, status);

            if (exists) {
                patchOperations = findPatchOperations(
                    exists,
                    response['x-apigateway'],
                    [],
                    [
                        'responseParameters^=integration.response',
                        'responseModels'
                    ]
                );

                _.updateIntegrationResponse(method, status, patchOperations, next);
            } else {
                _.createIntegrationResponse(method, status, next);
            }
        }, function(err, data) {
            _.APIDeploy.logger.succeed('Deployed Integration Responses:', method.pathInfo);

            done(null, method);
        });
    },

    createIntegrationResponse: function createIntegrationResponse(method, status, done) {
        var _ = this,
            response = method.responses[status]['x-apigateway'],
            body;

        _.APIDeploy.logger.log('Creating Integration Response:', method.pathInfo + ' (' + status + ')');

        if (response.selectionPattern) body.selectionPattern = response.selectionPattern;
        if (response.responseParameters) body.responseParameters = response.responseParameters;
        if (response.responseTemplates) body.responseTemplates = response.responseTemplates;

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/integration',
            method: 'PUT',
            body: body
        }, function(err, methodResponses) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Created Integration Response:', method.pathInfo + ' (' + status + ')');
            }

            done(null, methodResponses);
        });
    },

    updateIntegrationResponse: function updateIntegrationResponse(method, status, patchOperations, done) {
        var _ = this;

        if (!patchOperations.length) return done();

        _.APIDeploy.logger.log('Updating Integration Response:', method.pathInfo + ' (' + status + ')');

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
                _.APIDeploy.logger.succeed('Updated Integration Response:', method.pathInfo + ' (' + status + ')');
            }

            done(null, methodResponses);
        });

    },
};
