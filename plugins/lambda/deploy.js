var Utils = require('../../utils'),
    fs = require('fs'),
    async = require('async'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-vinyl-zip'),
    pluralize = require('pluralize'),
    gulpUtil = require('gulp-util');

module.exports = {
    deployLambdas: function deployLambdas(args, options, done) {
        var _ = this,
            lambdaMethods = [];

        args = args || [];

        _.APIDeploy.logger.log('Initiating Lambda Deploy');

        var methods = _.APIDeploy.findMethods(args);

        if (!methods.length) {
            var err = new Error('No Lambdas found: `' + args.join('`, `') + '`.');
            _.APIDeploy.logger.error(err);
            return done(err);
        } else {
            for (var i = 0; i < methods.length; i++) {
                if (methods[i].data['x-amazon-lambda']) {
                    lambdaMethods.push(methods[i]);
                }
            }
        }

        _.APIDeploy.logger.log('Deploying ' + lambdaMethods.length + ' ' + pluralize('Lambda', lambdaMethods.length));

        async.each(lambdaMethods, function(method, next) {
            _.deployLambda(method, next);
        }, function() {
            _.APIDeploy.logger.log('Deployed ' + lambdaMethods.length + ' ' + pluralize('Lambda', lambdaMethods.length));
            done();
        });
    },

    deployLambda: function deployLambda(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Compiling Lambda               - ' + method.data.operationId);

        var zipPath = './tmp/' + method.data.operationId + '.zip';

        browserify({
            standalone: 'handler',
            entries: [method.data['x-amazon-lambda'].handler],
            bare: true,
            browserField: false,
            builtins: false,
            commondir: false,
            detectGlobals: false,
            igv: '__filename,__dirname'
        })
        .exclude('aws-sdk')
        .bundle()
        .pipe(source(method.data['x-amazon-lambda'].handler))
        .pipe(buffer())
        .pipe(uglify(_.uglify).on('error', gulpUtil.log))
        .pipe(zip.dest(zipPath))
        .on('end', function zipComplete() {
            var zip = fs.readFileSync(zipPath);

            // fs.unlinkSync(zipPath);

            if (method.data['x-amazon-lambda'].arn) {
                _.updateLambda(method, zip, done);
            } else {
                _.createLambda(method, zip, done);
            }
        });
    },

    createLambda: function createLambda(method, zip, done) {
        var _ = this,
            lambda = method.data['x-amazon-lambda'],
            defaultLambda = _.lambda,
            options = {
                FunctionName:   method.data.operationId,
                Description:    lambda.description,
                Handler:        Utils.prepPath(lambda.handler, { joiner: '/' }) + '.handler',
                MemorySize:     lambda.memorySize || defaultLambda.memorySize,
                Role:           lambda.role       || defaultLambda.role,
                Timeout:        lambda.timeout    || defaultLambda.timeout,
                Runtime:        lambda.runtime    || defaultLambda.runtime,
                Code: {
                    ZipFile: zip
                }
            };

        _.APIDeploy.logger.log('Creating Lambda                - ' + method.data.operationId);

        _.AWSLambda.createFunction(options, function(err, data) {
            if (err) {
                if (err.message.indexOf('exist') !== -1) {
                    err.hint = 'This Lambda `' + method.data.operationId + '` exists at AWS already. ';
                    err.hint += 'Add the ARN in the config file for `' + method.data.operationId + '` OR delete it from the AWS Console, then re-deploy.';
                }

                _.APIDeploy.logger.error(err);
            } else {
                var swaggerLambda = method.data['x-amazon-lambda'];
                swaggerLambda.arn = data.FunctionArn;
                if (data.Role !== defaultLambda.role) swaggerLambda.role = data.Role;
                _.APIDeploy.logger.log('Created Lambda                 - ' + method.data.operationId);
            }

            done(err, data);
        });
    },

    updateLambda: function updateLambda(method, zip, done) {
        var _ = this,
            defaultLambda = _.lambda;

        var lambda = method.data['x-amazon-lambda'];

        _.APIDeploy.logger.log('Updating Lambda                - ' + method.data.operationId);

        async.series([
            function updateCode(next) {
                var options = {
                    FunctionName: lambda.arn,
                    ZipFile: zip
                };

                _.AWSLambda.updateFunctionCode(options, function(err, data) {
                    if (err) {
                        err.hint = 'This Lambda `' + method.data.operationId + '` doesn\'t exist at AWS. Delete the ARN in the config file for `' + method.data.operationId + '` and re-deploy.';
                    } else {
                        _.APIDeploy.logger.log('Updated Lambda Code            - ' + method.data.operationId);
                    }

                    next(err, data);
                });
            },
            function updateConfig(next) {
                var options = {
                    FunctionName:   lambda.arn,
                    Description:    lambda.description,
                    Handler:        Utils.prepPath(lambda.handler, { joiner: '/' }) + '.handler',
                    MemorySize:     lambda.memorySize || defaultLambda.memorySize,
                    Role:           lambda.role       || defaultLambda.role,
                    Timeout:        lambda.timeout    || defaultLambda.timeout
                };

                _.AWSLambda.updateFunctionConfiguration(options, function(err, data) {
                    if (!err) {
                        _.APIDeploy.logger.log('Updated Lambda Config          - ' + method.data.operationId);
                    }

                    next(err, data);
                });
            }
        ], function (err, results) {
            if (err) return _.APIDeploy.logger.error(err);
            done();
        });
    }
};
