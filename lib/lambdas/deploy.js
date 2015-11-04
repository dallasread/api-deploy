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

        var methods = _.getMethods(ids);

        if (!methods.length) {
            _.logger.error('No Lambdas found: `' + ids.join('`, `') + '`.');
            return done();
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

        if (!method['x-amazon-lambda']) {
            _.logger.error('Lambda does not exist: ' + method._path);
            return done(true);
        }

        _.logger.log('Compiling Lambda               - ' + method.operationId);

        method.operationId = method.operationId || Utils.prepPath(method['x-amazon-lambda'].handler + '-' + method._method.toUpperCase(), {
            prefix: _.sdk.name,
            humanize: true
        });

        var zipPath = './tmp/' + method.operationId + '.zip';

        browserify({
            standalone: 'handler',
            entries: [method['x-amazon-lambda'].handler],
            bare: true,
            browserField: false,
            builtins: false,
            commondir: false,
            detectGlobals: false,
            igv: '__filename,__dirname'
        })
        .bundle()
        .pipe(source(method['x-amazon-lambda'].handler))
        .pipe(buffer())
        .pipe(uglify(_.defaults.uglify))
        .pipe(zip.dest(zipPath))
        .on('end', function zipComplete() {
            var zip = fs.readFileSync(zipPath);

            fs.unlinkSync(zipPath);

            if (method['x-amazon-lambda'].arn) {
                _.updateLambda(method, zip, done);
            } else {
                _.createLambda(method, zip, done);
            }
        });
    },

    createLambda: function createLambda(method, zip, done) {
        var _ = this,
            lambda = method['x-amazon-lambda'],
            defaultLambda = _.defaults.lambda,
            options = {
                FunctionName:   method.operationId,
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

        _.logger.log('Creating Lambda                - ' + method.operationId);

        _.AWSLambda.createFunction(options, function(err, data) {
            if (err) {
                if (err.message.indexOf('exist') !== -1) {
                    err.hint = 'This Lambda `' + method.operationId + '` exists at AWS already. ';
                    err.hint += 'Add the ARN in the config file for `' + method.operationId + '` OR delete it from the AWS Console, then re-deploy.';
                }

                _.logger.error(err);
            } else {
                var swaggerLambda = _.swagger.data.paths[method._path][method._method]['x-amazon-lambda'];
                swaggerLambda.arn = data.FunctionArn;
                if (data.Role !== defaultLambda.role) swaggerLambda.role = data.Role;
                _.logger.log('Created Lambda                 - ' + method.operationId);
            }

            done(err, data);
        });
    },

    updateLambda: function updateLambda(method, zip, done) {
        var _ = this,
            lambda = method['x-amazon-lambda'],
            defaultLambda = _.defaults.lambda;

        _.logger.log('Updating Lambda                - ' + method.operationId);

        async.series([
            function updateCode(next) {
                var options = {
                    FunctionName: lambda.arn,
                    ZipFile: zip
                };

                _.AWSLambda.updateFunctionCode(options, function(err, data) {
                    if (err) {
                        err.hint = 'This Lambda `' + method.operationId + '` doesn\'t exist at AWS. Delete the ARN in the config file for `' + method.operationId + '` and re-deploy.';
                    } else {
                        _.logger.log('Updated Lambda Code            - ' + method.operationId);
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
                        _.logger.log('Updated Lambda Config          - ' + method.operationId);
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
