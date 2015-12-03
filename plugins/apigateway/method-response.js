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
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Responses:', method.pathInfo);

        async.forEachOfSeries(method.responses, function deployEachMethodResponse(response, status, next) {
            _.deployMethodResponse(method, status, done);
        }, function(err, data) {
            _.APIDeploy.logger.succeed('Deployed Method Responses:', method.pathInfo);

            done(null, method);
        });
    },

    deployMethodResponse: function deployMethodResponse(method, status, done) {
        var _ = this,
            funcs = [],
            patchOperations = [],
            exists = isDeployed(method, status);

        _.APIDeploy.logger.log('Deploying Method Response:', method.pathInfo + ' (' + status + ')');

        if (!exists) {
            funcs.push(function createMethodResponse(next) {
                _.createMethodResponse(method, status, next);
            });
        }

        funcs.push(function updateMethodResponse(next) {
            patchOperations = findPatchOperations(
                method.responses[status]['x-apigateway'],
                exists,
                [],
                [
                    '!responseParameters',
                    'responseModels'
                ]
            );

            _.updateMethodResponse(method, status, patchOperations, next);
        });

        async.series(funcs, function(err) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.log('Deployed Method Response:', method.pathInfo + ' (' + status + ')');
            }

            done(null, method);
        });
    },

    createMethodResponse: function createMethodResponse(method, status, done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating Method Response:', method.pathInfo + ' (' + status + ')');

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/responses/' + status,
            method: 'PUT',
            body: {
                responseParameters: {},
                responseModels: {}
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
