var nestedSet = require('../../utils/nested-set.js'),
    findPatchOperations = require('../../utils/find-patch-operations.js'),
    anyDifferent = require('../../utils/any-different.js'),
    async = require('async');

module.exports = {
    deployIntegrationRequest: function deployIntegrationRequest(method, done) {
        var _ = this,
            funcs = [];

        _.APIDeploy.logger.log('Deploying Integration Request:', method.pathInfo);

        if (anyDifferent(
                method['x-apigateway'],
                method.oldData,
                [
                    'credentials',
                    'httpMethod',
                    'type',
                    'uri'
                ]
        )) {
            funcs.push(function createIntegrationRequest(next) {
                _.createIntegrationRequest(method, next);
            });
        }

        funcs.push(function deployIntegrationRequestDetails(next) {
            _.deployIntegrationRequestDetails(method, next);
        });

        async.series(funcs, function(err, data) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Deployed Integration Request:', method.pathInfo);
            }

            done(null, method);
        });
    },

    createIntegrationRequest: function createIntegrationRequest(method, done) {
        var _ = this,
            attrs = method['x-apigateway'] || {},
            body = {};

        _.APIDeploy.logger.log('Deploying Integration Request:', method.pathInfo);

        if (attrs.type) body.type = attrs.type;
        if (attrs.credentials) body.credentials = attrs.credentials;
        if (attrs.httpMethod) body.httpMethod = attrs.httpMethod;
        if (attrs.uri) body.uri = attrs.uri;

        if (attrs.type === 'AWS') {
            if (!method['x-lambda'] || !method['x-lambda'].arn) {
                _.APIDeploy.logger.warn('Lambda not deployed:', method.pathInfo);
                return done(new Error('Try running this command with `--lambda` to update associated Lambdas.'));
            }

            if (!attrs.uri) {
                body.uri = 'arn:aws:apigateway:' +
                    _.aws.region +
                    ':lambda:path/2015-03-31/functions/' +
                    method['x-lambda'].arn +
                    '/invocations';

                nestedSet(method, 'x-apigateway.uri', body.uri);
            }

        }

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/integration',
            method: 'PUT',
            body: body
        }, function(err, awsIntegration) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Deployed Integration Request:', method.pathInfo);
                nestedSet(method, 'x-apigateway.cacheNamespace', awsIntegration.cacheNamespace);
            }

            done(null, method);
        });
    },

    deployIntegrationRequestDetails: function deployIntegrationRequestDetails(method, done) {
        var _ = this,
            patchOperations = [];

        _.APIDeploy.logger.log('Deploying Integration Request Details:', method.pathInfo);

        async.series([
            function setPatchOperations(next) {
                patchOperations = findPatchOperations(
                    method['x-apigateway'],
                    method.oldData,
                    [
                        'cacheNamespace'
                    ],
                    [
                        'requestParameters',
                        'requestTemplates'
                    ],
                    [
                        'cacheKeyParameters'
                    ]
                );

                next();
            },

            function updateIntegrationRequest(next) {
                _.updateIntegrationRequest(method, patchOperations, next);
            },
        ], function(err) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            } else {
                _.APIDeploy.logger.succeed('Deployed Integration Request Details:', method.pathInfo);
            }

            done(null, method);
        });
    },

    updateIntegrationRequest: function updateIntegrationRequest(method, patchOperations, done) {
        var _ = this;

        if (!patchOperations.length) return done();

        _.APIDeploy.logger.log('Updating Integration Request:', method.pathInfo);

        _.AWSRequest({
            path: '/restapis/' + method.restapi['x-apigateway'].id +
                '/resources/' + method.resource['x-apigateway'].id +
                '/methods/' + method.method.toUpperCase() +
                '/integration',
            method: 'PATCH',
            body: {
                patchOperations: patchOperations
            }
        }, function(err, awsIntegration) {
            if (err) {
                _.APIDeploy.logger.warn(err);
                return done(err);
            }

            _.APIDeploy.logger.succeed('Updated Integration Request:', method.pathInfo);

            done(null, method);
        });
    }
};
