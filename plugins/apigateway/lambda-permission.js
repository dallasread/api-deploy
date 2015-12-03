var async = require('async');

function sourceArn(aws, method) {
    var accountNumber = method['x-lambda'].role.replace(/[^\d]+/g, '');

    return 'arn:aws:execute-api:' +
        aws.region + ':' +
        accountNumber + ':' +
        method.restapi['x-apigateway'].id + '/*/' +
        method.method.toUpperCase() +
        method.path.replace(/\/$/, '');
}

module.exports = {
    deployLambdaPermission: function deployLambdaPermission(method, done) {
        var _ = this;

        if (!method['x-apigateway'] || method['x-apigateway'].type !== 'AWS') {
            return done();
        }

        _.APIDeploy.logger.log('Deploying Lambda Permission:', method.pathInfo);

        async.waterfall([
            function getLambdaPermission(next) {
                _.getLambdaPermission(method, function(err, data) {
                    if (err) return next();

                    if (data.Policy.indexOf(sourceArn(_.aws, method)) !== -1) {
                        return next(new Error('Lambda permission already exists.'));
                    }

                    next();
                });
            },
            function createLambdaPermission(next) {
                _.createLambdaPermission(method, function(err) {
                    if (err) {
                        _.APIDeploy.logger.warn(err);
                    }

                    done(null, method);
                });
            }
        ], function(err, data) {
            _.APIDeploy.logger.log('Deployed Lambda Permission:', method.pathInfo);

            done();
        });
    },

    getLambdaPermission: function getLambdaPermission(method, done) {
        var _ = this;

        _.AWSLambda.getPolicy({
            FunctionName: method.operationId
        }, done);
    },

    createLambdaPermission: function createLambdaPermission(method, done) {
        var _ = this,
            StatementId = 'api-deploy-access-' + Date.now();

        _.APIDeploy.logger.log('Creating Lambda Permission:', method.pathInfo);

        _.AWSLambda.addPermission({
            Action: 'lambda:InvokeFunction',
            FunctionName: method.operationId,
            Principal: 'apigateway.amazonaws.com',
            StatementId: StatementId,
            SourceArn: sourceArn(_.aws, method)
        }, function(err, data) {
            if (err) return done(err);

            _.APIDeploy.logger.log('Created Lambda Permission:', method.pathInfo);

            done(null, data);
        });
    },
};
