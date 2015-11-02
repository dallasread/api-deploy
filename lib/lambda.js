var Utils = require('./utils'),
    fs = require('fs'),
    async = require('async'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-vinyl-zip'),
    pluralize = require('pluralize');

module.exports = {
    deployLambdas: function deployLambdas(routes, done) {
        var _ = this,
            methods = [],
            route, key;

        _.logger.log('Deploying ' + pluralize('Lambda', methods.length));

        routes = _.findRoutes({
            routes: routes
        });

        if (!routes.length) {
            return done('Lambda not found `' + routes.join('`, `') + '`');
        }

        for (var i = 0; i < routes.length; i++) {
            route = routes[i];

            for (key in route) {
                if (key[0] !== 'x') {
                    methods.push(route[key]);
                }
            }
        }

        async.each(methods, function(method, next) {
            _.deployLambda(method, next);
        }, function(err, data) {
            _.logger.log('Deployed ' + pluralize('Lambda', methods.length));
            _.cleanup(done);
        });
    },

    deployLambda: function deployLambda(method, done) {
        if (!method['x-apiDeploy']) return done();

        var _ = this,
            path = method['x-apiDeploy'].lambda.handler;

        _.logger.log('Compiling Lambda               - ' + method.operationId);

        method.operationId = method.operationId || Utils.prepPath(method['x-apiDeploy'].lambda.handler, {
            prefix: _.cfg['x-apiDeploy'].sdk.name,
            humanize: true
        });

        var zipPath = './tmp/' + method.operationId + '.zip';

        browserify({
            standalone: 'handler',
            entries: [path],
            bare: true,
            browserField: false,
            builtins: false,
            commondir: false,
            detectGlobals: false,
            igv: '__filename,__dirname'
        })
        .exclude('aws-sdk')
        .bundle()
        .pipe(source(path))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(zip.dest(zipPath))
        .on('end', function zipComplete() {
            var zip = fs.readFileSync(zipPath);

            fs.unlinkSync(zipPath);

            if (method['x-apiDeploy'].lambda.id) {
                _.updateLambda(method, zip, done);
            } else {
                _.createLambda(method, zip, done);
            }
        });
    },

    createLambda: function createLambda(method, zip, done) {
        var _ = this,
            lambda = method['x-apiDeploy'].lambda,
            defaultLambda = _.cfg['x-apiDeploy'].lambda,
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

        async.series([
            function (next) {
                _.AWSLambda.createFunction(options, function(err, data) {
                    if (err) {
                        if (err.message.indexOf('exist') !== -1) {
                            err.hint = 'This Lambda `' + method.operationId + '` exists at AWS already. ';
                            err.hint += 'Add the ARN in the config file for `' + method.operationId + '` OR delete it from the AWS Console, then re-deploy.';
                        }
                    } else {
                        lambda.id = data.FunctionArn;
                        if (data.Role !== defaultLambda.role) method.role = data.Role;
                        _.logger.log('Created Lambda                 - ' + method.operationId);
                    }

                    next(err, data);
                });
            }
        ], function (err, results) {
            if (err) return _.logger.error(err);
            done(null, results);
        });

    },

    updateLambda: function updateLambda(method, zip, done) {
        var _ = this,
            lambda = method['x-apiDeploy'].lambda,
            defaultLambda = _.cfg['x-apiDeploy'].lambda;

        _.logger.log('Updating Lambda                - ' + method.operationId);

        async.series([
            function updateCode(next) {
                var options = {
                    FunctionName: lambda.id,
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
                    FunctionName:   lambda.id,
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
