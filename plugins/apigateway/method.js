var async = require('async');

function isDeployed(method) {
    return method['x-apigateway'] && method['x-apigateway'].id;
}

module.exports = {
    deployMethods: function deployMethods(methods, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying ' + Object.keys(methods).length + ' Methods...');

        async.each(methods, function(method, next) {
            _.deployMethod(method, next);
        }, function(err) {
            _.APIDeploy.logger.succeed('Deployed ' + Object.keys(methods).length + ' Methods successfully.');
            done(null, methods);
        });
    },

    deployMethod: function deployMethod(method, done) {
        var _ = this,
            action = isDeployed(method) ? _.createMethod : _.updateMethod;

        _.APIDeploy.logger.log('Deploying Method:', method.path);

        action.call(_, method, function deployedMethod(err, data) {
            _.deployMethodDetails(method, function deployedMethodDetails(err, method) {
                _.APIDeploy.logger.succeed('Deployed Method:', method.path);
                done(null, method);
            });
        });

    },

    createMethod: function createMethod(method, done) {
        var _ = this;

        done();
    },

    updateMethod: function updateMethod(method, done) {
        var _ = this;

        done();
    },

    deployMethodDetails: function deployMethodDetails(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Details:', method.path);

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
            _.APIDeploy.logger.succeed('Deployed Method Details:', method.path);
            done(null, method);
        });
    }
};
