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
    deployMethodResponses: function deployMethodResponses(method, done) {
        var _ = this,
            patchOperations = [];

        _.APIDeploy.logger.log('Deploying Method Responses:', method.pathInfo);

        async.forEachOfSeries(method.responses, function deployEachMethodResponse(response, status, next) {
            var exists = isDeployed(method, status);

            if (exists) {
                patchOperations = findPatchOperations(
                    exists,
                    response['x-apigateway'],
                    [],
                    [
                        'responseParameters^=method.response',
                        'responseModels'
                    ]
                );

                _.updateMethodResponse(method, status, patchOperations, next);
            } else {
                _.createMethodResponse(method, status, next);
            }
        }, function(err, data) {
            _.APIDeploy.logger.succeed('Deployed Method Responses:', method.pathInfo);

            done(null, method);
        });
    },

    createMethodResponse: function createMethodResponse(method, status, done) {
        var _ = this,
            response = method.responses[status]['x-apigateway'];

        _.APIDeploy.logger.log('Creating Method Response:', method.pathInfo + ' (' + status + ')');

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/responses/' + status,
            method: 'PUT',
            body: {
                responseParameters: response.responseParameters,
                responseModels: response.responseModels
            }
        }, function(err, methodResponses) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Created Method Response:', method.pathInfo + ' (' + status + ')');
            }

            done(null, methodResponses);
        });
    },

    updateMethodResponse: function updateMethodResponse(method, status, patchOperations, done) {
        var _ = this;

        if (!patchOperations.length) return done();

        _.APIDeploy.logger.log('Updating Method Response:', method.pathInfo + ' (' + status + ')');

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/responses/' + status,
            method: 'PATCH',
            body: {
                patchOperations: patchOperations
            }
        }, function(err, methodResponses) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Updated Method Response:', method.pathInfo + ' (' + status + ')');
            }

            done(null, methodResponses);
        });

    },
};
