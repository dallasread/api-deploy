var AWSRequest = require('./aws-request'),
    async = require('async'),
    getRestAPIItemID = require('./utils/get-rest-api-item-id');

module.exports = {
    deployRestAPIIntegrations: function deployRestAPIIntegrations(methods, done) {
        var _ = this;

        async.each(methods, function(method, done) {
            _.deployRestAPIIntegration(method, done);
        }, done);
    },

    deployRestAPIIntegration: function deployRestAPIIntegration(method, done) {
        var _ = this;

        if (getRestAPIItemID(method)) {
            _.updateRestAPIIntegration(method, done);
        } else {
            _.createRestAPIIntegration(method, done);
        }
    },

    createRestAPIIntegration: function createRestAPIIntegration(method, done) {
        var _ = this,
            restAPI = _.cfg['x-apiDeploy'].restAPI;

        _.logger.log('Creating Integration           - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        AWSRequest({
            path: '/restapis/' + restAPI.id +
                '/resources/' + method['x-apiDeployRoute']['x-apiDeploy'].restAPI.id +
                '/methods/' + method['x-apiDeployMethod'] +
                '/integration',
            method: 'PUT',
            body: {
                type: 'AWS',
                httpMethod: method['x-apiDeployMethod'],
                uri: 'arn:aws:apigateway:' + _.cfg['x-apiDeploy'].aws.region + ':lambda:path/2015-03-31/functions/' + method['x-apiDeploy'].lambda.id + '/invocations',
                credentials: _.cfg['x-apiDeploy'].lambda.role,
                requestParameters: {}
            }
        }, function(err, integration) {
            if (err) return done(err);

            method['x-apiDeploy'] = method['x-apiDeploy'] || {};
            method['x-apiDeploy'].restAPI = method['x-apiDeploy'].restAPI || {};
            method['x-apiDeploy'].restAPI.id = integration.uri;

            _.createRestAPIIntegrationResponse(method, function() {
                _.logger.log('Created Integration            - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');
                done();
            });
        });
    },

    updateRestAPIIntegration: function updateRestAPIIntegration(method, done) {
        var _ = this;

        _.logger.log('Updating Integration           - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');
        _.logger.log('Updated Integration            - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        done();
    },

    createRestAPIIntegrationResponse: function createRestAPIIntegrationResponse(method, done) {
        var _ = this,
            restAPI = _.cfg['x-apiDeploy'].restAPI;

        _.logger.log('Creating Integration Response  - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        AWSRequest({
            path: '/restapis/' + restAPI.id +
                '/resources/' + method['x-apiDeployRoute']['x-apiDeploy'].restAPI.id +
                '/methods/' + method['x-apiDeployMethod'] +
                '/integration/responses/200',
            method: 'PUT',
            body: {
                // selectionPattern: 'String',
                responseParameters: {},
                responseTemplates: {
                    'application/json': null
                }
            }
        }, function(err, integration) {
            if (err) return done(err);

            _.logger.log('Created Integration Response   - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

            done();
        });
    }
};
