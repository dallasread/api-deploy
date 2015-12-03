var async = require('async'),
    findPatchOperations = require('../../utils/find-patch-operations.js');

module.exports = {
    deployMethodRequest: function deployMethodRequest(method, done) {
        var _ = this,
            patchOperations = [];

        _.APIDeploy.logger.log('Deploying Method Request:', method.pathInfo);

        async.series([
            function getMethod(next) {
                _.getMethod(method, function(err) {
                    if (err) return next(err);

                    patchOperations = findPatchOperations(
                        method['x-apigateway'],
                        method.oldData,
                        [
                            'authorizationType',
                            'apiKeyRequired'
                        ],
                        [
                            'requestParameters',
                            'requestModels'
                        ]
                    );

                    next();
                });
            },

            function updateMethod(next) {
                _.updateMethod(method, patchOperations, next);
            },
        ], function(err) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Deployed Method Request:', method.pathInfo);
            }

            done(null, method);
        });
    },

    deployMethodResponse: function deployMethodResponse(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Response:', method.pathInfo);
        _.APIDeploy.logger.succeed('Deployed Method Response:', method.pathInfo);

        // do stuff

        done(null, method);
    },
};
