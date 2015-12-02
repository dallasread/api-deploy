var async = require('async');

function findPatchOperations(method, oldData) {
    var patchOperations = [],
        stringUpdates = [
            'authorizationType',
            'apiKeyRequired'
        ],
        objectUpdates = [
            'requestParameters',
            'requestModels'
        ],
        obj, i, objName, oldObj, key;

    for (i = stringUpdates.length - 1; i >= 0; i--) {
        patchOperations.push({
            op: 'replace',
            path: '/' + stringUpdates[i],
            value: method['x-apigateway'][stringUpdates[i]] + ''
        });
    }

    for (i = objectUpdates.length - 1; i >= 0; i--) {
        objName = objectUpdates[i];
        obj = method['x-apigateway'][objName] || {};
        oldObj = oldData[objName] || {};

        for (key in obj) {
            patchOperations.push({
                op: 'add',
                path: '/' + objName + '/' + key
                    .replace(/~/, '~0')
                    .replace(/\//, '~1'),
                value: obj[key]
            });
        }

        for (key in oldObj) {
            if (!obj[key]) {
                patchOperations.push({
                    op: 'remove',
                    path: '/' + objName + '/' + key
                        .replace(/~/, '~0')
                        .replace(/\//, '~1')
                });

                // TODO: Should we really delete stuff on AWS? If no, do this:
                // obj[key] = oldObj[key];
            }
        }
    }

    return patchOperations;
}

module.exports = {
    deployMethodRequest: function deployMethodRequest(method, done) {
        var _ = this,
            patchOperations = [];

        _.APIDeploy.logger.log('Deploying Method Request:', method.pathInfo);

        async.series([
            function getMethod(next) {
                _.getMethod(method, function(err, awsMethod) {
                    if (err) return next(err);
                    patchOperations = findPatchOperations(method, awsMethod);
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
