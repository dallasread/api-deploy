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
            accountNumber = cfg.lambda.role.replace(/[^\d]+/, '');

        _.logger.log('Creating Access Policy         - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        var statement = {
            Action: 'lambda:InvokeFunction',
            FunctionName: method.operationId,
            Principal: 'apigateway.amazonaws.com',
            StatementId: 'apiDeploy-' + method.operationId,
            SourceArn: 'arn:aws:execute-api:' + cfg.aws.region + ':' + accountNumber + ':' + cfg.restAPI.id + '/*/' + method['x-apiDeployMethod'] + method['x-apiDeployPath']
        };

        lambda.addPermission(statement, function(err, data) {
            if (err) return done(err);

            _.logger.log('Created Access Policy          - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

            done();
        });
    },

    updateRestAPIAccessPolicy: function updateRestAPIAccessPolicy(method, done) {
        var _ = this;

        _.logger.log('Updating Access Policy         - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');
        _.logger.log('Updated Access Policy          - ' + method['x-apiDeployPath'] + ' (' + method['x-apiDeployMethod'] + ')');

        done();
    }
};
