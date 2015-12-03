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

        async.eachSeries(methods, function(method, next) {
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

                next(null, method);
            });
        });

        async.series(funcs, function(err, data) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                method.setHidden('deployed', true);
                _.APIDeploy.logger.succeed('Deployed Method:', method.pathInfo);
            }

            done(null, method);
        });
    },

    createMethod: function createMethod(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating Method:', method.pathInfo);

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

            nestedSet(method, 'x-apigateway.id', awsMethod.id);

            done(null, method);
        });
    },

    getMethod: function getMethod(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Finding Method:', method.pathInfo);

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase(),
            method: 'GET'
        }, function(err, awsMethod) {
            if (err) {
                _.APIDeploy.logger.warn(err);
                return done(err);
            }

            method.setHidden('oldData', awsMethod);

            _.APIDeploy.logger.succeed('Found Method:', method.pathInfo);

            done(null, awsMethod);
        });
    },

    updateMethod: function updateMethod(method, patchOperations, done) {
        var _ = this;

        if (!patchOperations.length) return done();

        _.APIDeploy.logger.log('Updating Method:', method.pathInfo);

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

        async.series([
            function deployMethodRequest(next) {
                _.deployMethodRequest(method, next);
            },

            function deployIntegrationRequest(next) {
                _.deployIntegrationRequest(method, next);
            },

            function deployMethodResponses(next) {
                _.deployMethodResponses(method, next);
            },

            function deployIntegrationResponses(next) {
                _.deployIntegrationResponses(method, next);
            },

            function deployIntegrationResponses(next) {
                _.deployLambdaPermission(method, next);
            }
        ], function(err) {
            _.APIDeploy.logger.succeed('Deployed Method Details:', method.pathInfo);

            done(null, method);
        });
    }
};
