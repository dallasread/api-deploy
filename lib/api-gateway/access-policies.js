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

        async.each(_.methods, function(method, done) {
            _.deployRestAPIAccessPolicy(method, done);
        }, done);
    },

    updateRestAPIAccessPolicies: function updateRestAPIAccessPolicies(ids, done) {
        var _ = this;

        _.findMethods(ids);

        async.each(_.methods, function(method, done) {
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
            accountNumber = _.defaults.lambda.role.replace(/[^\d]+/g, ''),
            StatementId = 'api-deploy-access';

        _.logger.log('Creating Access Policy         - ' + method._path + ' (' + method._method + ')');

        lambda.removePermission({
            FunctionName: method.data['x-amazon-lambda'].arn,
            StatementId: StatementId
        }, function(err, data) {
            lambda.addPermission({
                Action: 'lambda:InvokeFunction',
                FunctionName: method.data['x-amazon-lambda'].arn,
                Principal: 'apigateway.amazonaws.com',
                StatementId: StatementId,
                // SourceArn:
                //     'arn:aws:execute-api:' +
                //     _.defaults.aws.region + ':' +
                //     accountNumber + ':' +
                //     _.swagger.data['x-amazon-apigateway-restapi'].id + '/*/' +
                //     method._method +
                //     method._path.replace(/\/$/, '') +
                //     '/invocations'
            }, function(err, data) {
                if (err) return done(err);

                _.logger.log('Created Access Policy          - ' + method._path + ' (' + method._method + ')');

                done(err, data);
            });
        });
    },

    updateRestAPIAccessPolicy: function updateRestAPIAccessPolicy(method, done) {
        var _ = this;

        _.logger.log('Updating Access Policy         - ' + method._path + ' (' + method._method + ')');
        _.logger.log('Updated Access Policy          - ' + method._path + ' (' + method._method + ')');

        done();
    }
};
