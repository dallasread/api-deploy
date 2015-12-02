var async = require('async'),
    pluralize = require('pluralize'),
    nestedSet = require('../../utils/nested-set');

function isDeployed(method) {
    return method['x-apigateway'] && method['x-apigateway'].id;
}

module.exports = {
    deployMethods: function deployMethods(methodsOrResource, done) {
        var _ = this,
            methods = methodsOrResource,
            path;

        if (typeof methodsOrResource === 'object') { // It's a resource!
            var newMethods = [];

            path = methodsOrResource.path;

            for (var key in methodsOrResource) {
                if (key.slice(0, 2) !== 'x-') {
                    newMethods.push(methodsOrResource[key]);
                }
            }

            methods = newMethods;
        }

        _.APIDeploy.logger.log('Deploying ' + Object.keys(methods).length + ' Methods' + (path ? ':' : '...'), path);

        _.APIDeploy.each(methods, function(method, next) {
            _.deployMethod(method, next);
        }, function(err) {
            var deployedCount = methods.filter(function(method) { return method.deployed; }).length;

            _.APIDeploy.logger.succeed('Deployed ' + deployedCount + ' ' + pluralize('Method', deployedCount) + (path ? ':' : '.'), path);

            done(null, methods);
        });
    },

    deployMethod: function deployMethod(method, done) {
        var _ = this,
            funcs = [];

        _.APIDeploy.logger.log('Deploying Method:', method.pathInfo);

        if (!isDeployed(method)) {
            funcs.push(function createMethod(next) {
                _.createMethod(method, function createdMethod(err, method) {
                    if (err) {
                        _.APIDeploy.logger.warn(err);
                    }

                    next(null, method);
                });
            });
        }

        funcs.push(function deployMethodDetails(next) {
            _.deployMethodDetails(method, function deployedMethodDetails(err, method) {
                if (err) {
                    _.APIDeploy.logger.warn(err);
                    return next(null, method);
                }

                method.setHidden('deployed', true);

                _.APIDeploy.logger.succeed('Deployed Method:', method.pathInfo);

                next(null, method);
            });
        });

        async.series(funcs, function(err, data) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            }

            done(null, method);
        });
    },

    createMethod: function createMethod(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating Method:', method.pathInfo);

        if (!method['x-apigateway']) {
            _.APIDeploy.logger.warn('No API Gateway configuration:', method.pathInfo);
            return done(null, method);
        }

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase(),
            method: 'PUT',
            body: {
                authorizationType: 'NONE'
            }
        }, function(err, awsMethod) {
            if (err) {
                _.APIDeploy.logger.warn(err);
                return done(err);
            }

            _.APIDeploy.logger.succeed('Created Method:', method.pathInfo);

            nestedSet(method, method.method.toLowerCase() + '.x-apigateway.id', awsMethod.id);

            done(null, method);
        });
    },

    updateMethod: function updateMethod(method, done) {
        var _ = this,
            patchOperations = [],
            updates = [
                'authorizationType',
                'apiKeyRequired'
            ];

        _.APIDeploy.logger.log('Updating Method:', method.pathInfo);

        for (var i = updates.length - 1; i >= 0; i--) {
            patchOperations.push({
                op: 'replace',
                path: '/' + updates[i],
                value: method['x-apigateway'][updates[i]] + ''
            });
        }

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase(),
            method: 'PATCH',
            body: {
                patchOperations: patchOperations
            }
        }, function(err, awsMethod) {
            if (err) {
                _.APIDeploy.logger.warn(err);
                return done(err);
            }

            _.APIDeploy.logger.succeed('Updated Method:', method.pathInfo);

            done(null, method);
        });
    },

    deployMethodDetails: function deployMethodDetails(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Details:', method.pathInfo);

        async.parallel([
            function updateMethod(next) {
                _.updateMethod(method, next);
            },

            function deployMethodRequest(next) {
                _.deployMethodRequest(method, next);
            },

            function deployIntegrationRequest(next) {
                _.deployIntegrationRequest(method, next);
            },

            function deployIntegrationResponse(next) {
                _.deployIntegrationResponse(method, next);
            },

            function deployMethodResponse(next) {
                _.deployMethodResponse(method, next);
            }
        ], function(err) {
            _.APIDeploy.logger.succeed('Deployed Method Details:', method.pathInfo);

            done(null, method);
        });
    }
};
