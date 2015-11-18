var AWS = require('aws-sdk'),
    async = require('async');

function getMethodID(method) {
    return method && method.data &&
        method.data['x-amazon-apigateway-integration'] &&
        method.data['x-amazon-apigateway-integration'].uri;
}

module.exports = {
    deployRestAPIAccessPolicies: function deployRestAPIAccessPolicies(done) {
        var _ = this;

        async.each(_.APIDeploy.methods, function(method, done) {
            _.deployRestAPIAccessPolicy(method, done);
        }, done);
    },

    updateRestAPIAccessPolicies: function updateRestAPIAccessPolicies(ids, done) {
        var _ = this;

        _.APIDeploy.findMethods(ids);

        async.each(_.APIDeploy.methods, function(method, done) {
            _.createRestAPIAccessPolicy(method, done);
        }, done);
    },

    deployRestAPIAccessPolicy: function deployRestAPIAccessPolicy(method, done) {
        var _ = this;

        if (getMethodID(method)) {
            _.updateRestAPIAccessPolicy(method, done);
        } else {
            _.createRestAPIAccessPolicy(method, done);
        }
    },

    createRestAPIAccessPolicy: function createRestAPIAccessPolicy(method, done) {
        var _ = this,
            lambda = new AWS.Lambda(),
            accountNumber = _.lambda.role.replace(/[^\d]+/g, ''),
            StatementId = 'api-deploy-access';

        _.APIDeploy.logger.log('Creating Access Policy         - ' + method._path + ' (' + method._method + ')');

        lambda.removePermission({
            FunctionName: method.data.operationId,
            StatementId: StatementId
        }, function(err, data) {
            lambda.addPermission({
                Action: 'lambda:InvokeFunction',
                FunctionName: method.data.operationId,
                Principal: 'apigateway.amazonaws.com',
                StatementId: StatementId,
                SourceArn:
                    'arn:aws:execute-api:' +
                    _.aws.region + ':' +
                    accountNumber + ':' +
                    _.APIDeploy.swagger.data['x-amazon-apigateway-restapi'].id + '/*/' +
                    method._method +
                    method._path.replace(/\/$/, '')
            }, function(err, data) {
                if (err) return done(err);

                _.APIDeploy.logger.log('Created Access Policy          - ' + method._path + ' (' + method._method + ')');

                done(err, data);
            });
        });
    },

    updateRestAPIAccessPolicy: function updateRestAPIAccessPolicy(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Updating Access Policy         - ' + method._path + ' (' + method._method + ')');
        _.APIDeploy.logger.log('Updated Access Policy          - ' + method._path + ' (' + method._method + ')');

        done();
    }
};
