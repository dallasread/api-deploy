var Utils = require('../utils'),
    fs = require('fs'),
    async = require('async'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-vinyl-zip'),
    pluralize = require('pluralize');

module.exports = {
    deployLambdas: function deployLambdas(ids, done) {
        var _ = this;

        _.logger.log('Initiating Lambda Deploy');

        if (typeof ids === 'string') ids = [ids];

        var methods = _.findMethods(ids);

        if (!methods.length) {
            var err = new Error('No Lambdas found: `' + ids.join('`, `') + '`.');
            _.logger.error(err);
            return done(err);
        }

        _.logger.log('Deploying ' + methods.length + ' ' + pluralize('Lambda', methods.length));

        async.each(methods, function(method, next) {
            _.deployLambda(method, next);
        }, function() {
            _.saveSwagger();
            _.logger.log('Deployed ' + methods.length + ' ' + pluralize('Lambda', methods.length));
            done();
        });
    },

    deployLambda: function deployLambda(method, done) {
        var _ = this;

        _.logger.log('Compiling Lambda               - ' + method.data.operationId);

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
        .bundle()
        .pipe(source(method.data['x-amazon-lambda'].handler))
        .pipe(buffer())
        .pipe(uglify(_.defaults.uglify))
        .pipe(zip.dest(zipPath))
        .on('end', function zipComplete() {
            var zip = fs.readFileSync(zipPath);

            fs.unlinkSync(zipPath);

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
            defaultLambda = _.defaults.lambda,
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

        _.logger.log('Creating Lambda                - ' + method.data.operationId);

        _.AWSLambda.createFunction(options, function(err, data) {
            if (err) {
                if (err.message.indexOf('exist') !== -1) {
                    err.hint = 'This Lambda `' + method.data.operationId + '` exists at AWS already. ';
                    err.hint += 'Add the ARN in the config file for `' + method.data.operationId + '` OR delete it from the AWS Console, then re-deploy.';
                }

                _.logger.error(err);
            } else {
                var swaggerLambda = method.data['x-amazon-lambda'];
                swaggerLambda.arn = data.FunctionArn;
                if (data.Role !== defaultLambda.role) swaggerLambda.role = data.Role;
                _.logger.log('Created Lambda                 - ' + method.data.operationId);
            }

            done(err, data);
        });
    },

    updateLambda: function updateLambda(method, zip, done) {
        var _ = this,
            defaultLambda = _.defaults.lambda;

        var lambda = method.data['x-amazon-lambda'];

        _.logger.log('Updating Lambda                - ' + method.data.operationId);

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
                        _.logger.log('Updated Lambda Code            - ' + method.data.operationId);
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
                        _.logger.log('Updated Lambda Config          - ' + method.data.operationId);
                    }

                    next(err, data);
                });
            }
        ], function (err, results) {
            if (err) return _.logger.error(err);
            done(null, results);
        });
    }
};
