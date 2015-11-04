var async = require('async'),
    AWSRequest = require('../../utils/aws-request'),
    getRestAPIItemID = function() {};

module.exports = {
    deployRestAPIMethods: function deployRestAPIMethods(methods, done) {
        var _ = this;

        async.each(methods, function(method, done) {
            _.deployRestAPIMethod(method, done);
        }, done);
    },

    deployRestAPIMethod: function deployRestAPIMethod(method, done) {
        var _ = this;

        if (getRestAPIItemID(method)) {
            _.updateRestAPIMethod(method, done);
        } else {
            _.createRestAPIMethod(method, done);
        }
    },

    createRestAPIMethod: function createRestAPIMethod(method, done) {
        var _ = this,
            restAPI = _.cfg['x-apiDeploy'].restAPI;

        _.logger.log('Creating Method                - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        AWSRequest({
            path: '/restapis/' + restAPI.id +
                '/resources/' + method['x-apiDeployRoute']['x-apiDeploy'].restAPI.id +
                '/methods/' + method['x-apiDeployMethod'],
            method: 'PUT',
            body: {
                authorizationType: 'NONE',
                apiKeyRequired: false,
                requestParameters: {
                    'method.request.header.Authorization': true
                },
                requestModels: {
                    'application/json': 'Empty'
                }
            }
        }, function(err, newMethod) {
            if (err) return done(err);

            _.logger.log('Created Method                 - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

            _.createRestAPIMethodResponse(method, function() {
                _.createRestAPIAccessPolicy(method, function() {
                    done();
                });
            });
        });
    },

    updateRestAPIMethod: function updateRestAPIMethod(method, done) {
        var _ = this;

        _.logger.log('Updating Method                - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');
        _.logger.log('Updated Method                 - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        done();
    },

    createRestAPIMethodResponse: function createRestAPIMethodResponse(method, done) {
        var _ = this,
            restAPI = _.cfg['x-apiDeploy'].restAPI;

        _.logger.log('Creating Method Response       - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        AWSRequest({
            path: '/restapis/' + restAPI.id +
                '/resources/' + method['x-apiDeployRoute']['x-apiDeploy'].restAPI.id +
                '/methods/' + method['x-apiDeployMethod'] +
                '/responses/200',
            method: 'PUT',
            body: {
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Origin': true
                },
                responseModels: {
                    'application/json': 'Empty'
                }
            }
        }, function(err, integration) {
            if (err) return done(err);

            _.logger.log('Created Method Response        - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

            done();
        });
    }
};
