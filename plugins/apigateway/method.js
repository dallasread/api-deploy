var async = require('async');

function isDeployed(method) {
    return method['x-apigateway'] && method['x-apigateway'].id;
}

module.exports = {
    deployMethods: function deployMethods(methods, done) {
        var _ = this,
            path;

        if (typeof methods === 'object') { // It's a resource!
            var newMethods = [];

            path = methods.path;

            for (var key in methods) {
                newMethods.push(methods[key]);
            }

            methods = newMethods;
        }

        _.APIDeploy.logger.log('Deploying ' + Object.keys(methods).length + ' Methods' + (path ? ':' : '...'), path);

        _.APIDeploy.each(methods, function(method, next) {
            _.deployMethod(method, next);
        }, function(err) {
            _.APIDeploy.logger.succeed('Deployed ' + Object.keys(methods).length + ' Methods' + (path ? ':' : '.'), path);
            done(null, methods);
        });
    },

    deployMethod: function deployMethod(method, done) {
        var _ = this,
            action = isDeployed(method) ? _.createMethod : _.updateMethod;

        _.APIDeploy.logger.log('Deploying Method:', method.pathInfo);

        action.call(_, method, function deployedMethod(err, data) {
            _.deployMethodDetails(method, function deployedMethodDetails(err, method) {
                _.APIDeploy.logger.succeed('Deployed Method:', method.pathInfo);
                done(null, method);
            });
        });

    },

    createMethod: function createMethod(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating Method:', method.pathInfo);
        _.APIDeploy.logger.succeed('Created Method:', method.pathInfo);

        done();
    },

    updateMethod: function updateMethod(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Updating Method:', method.pathInfo);
        _.APIDeploy.logger.succeed('Updated Method:', method.pathInfo);

        done();
    },

    deployMethodDetails: function deployMethodDetails(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Details:', method.pathInfo);

        async.parallel([
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
        ], function() {
            _.APIDeploy.logger.succeed('Deployed Method Details:', method.pathInfo);
            done(null, method);
        });
    }
};
