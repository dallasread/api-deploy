var AWS = require('aws-sdk'),
    async = require('async'),
    getRestAPIItemID = require('./utils/get-rest-api-item-id');

module.exports = {
    deployRestAPIAccessPolicies: function deployRestAPIAccessPolicies(methods, done) {
        var _ = this;

        async.each(methods, function(method, done) {
            _.deployRestAPIAccessPolicy(method, done);
        }, done);
    },

    deployRestAPIAccessPolicy: function deployRestAPIAccessPolicy(method, done) {
        var _ = this;

        if (getRestAPIItemID(method)) {
            _.updateRestAPIAccessPolicy(method, done);
        } else {
            _.createRestAPIAccessPolicy(method, done);
        }
    },

    createRestAPIAccessPolicy: function createRestAPIAccessPolicy(method, done) {
        var _ = this,
            cfg = _.cfg['x-apiDeploy'],
            lambda = new AWS.Lambda(),
            accountNumber = cfg.lambda.role.replace(/[^\d]+/g, ''),
            StatementId = 'apiDeploy-access';

        _.logger.log('Creating Access Policy         - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        lambda.removePermission({
            FunctionName: method['x-apiDeploy'].lambda.id,
            StatementId: StatementId
        }, function(err, data) {
            lambda.addPermission({
                Action: 'lambda:InvokeFunction',
                FunctionName: method['x-apiDeploy'].lambda.id,
                Principal: 'apigateway.amazonaws.com',
                StatementId: StatementId,
                SourceArn:
                    'arn:aws:execute-api:' +
                    cfg.aws.region + ':' +
                    accountNumber + ':' +
                    cfg.restAPI.id + '/*/' +
                    method['x-apiDeployMethod'] +
                    method['x-apiDeployPath'].replace(/\/$/, '')
            }, function(err, data) {
                if (err) return done(err);

                _.logger.log('Created Access Policy          - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

                done(err, data);
            });
        });
    },

    updateRestAPIAccessPolicy: function updateRestAPIAccessPolicy(method, done) {
        var _ = this;

        _.logger.log('Updating Access Policy         - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');
        _.logger.log('Updated Access Policy          - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        done();
    }
};
