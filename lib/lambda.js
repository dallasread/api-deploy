var Utils = require('./utils'),
    fs = require('fs'),
    async = require('async'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-vinyl-zip');

module.exports = {
    deployLambda: function deployLambda(route, done) {
        var _ = this,
            path = route.apiDeploy.lambda.handler;

        _.logger.log('Compiling Lambda      - ' + route.operationId);

        route.operationId = route.operationId || Utils.prepPath(route.apiDeploy.lambda.handler, {
            prefix: _.cfg.apiDeploy.sdk.name,
            humanize: true
        });

        var zipPath = './tmp/' + route.operationId + '.zip';

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
        .on('end', function() {
            var zip = fs.readFileSync(zipPath);
            // fs.unlinkSync(zipPath);

            if (route.apiDeploy.lambda.arn) {
                _.updateLambda(route, zip, done);
            } else {
                _.createLambda(route, zip, done);
            }
        });
    },

    createLambda: function createLambda(route, zip, done) {
        var _ = this,
            options = {
                FunctionName:   route.operationId,
                Description:    route.apiDeploy.lambda.description,
                Handler:        Utils.prepPath(route.apiDeploy.lambda.handler, { joiner: '/' }) + '.handler',
                MemorySize:     route.apiDeploy.lambda.memorySize || _.cfg.apiDeploy.defaults.lambda.memorySize,
                Role:           route.apiDeploy.lambda.role       || _.cfg.apiDeploy.defaults.lambda.role,
                Timeout:        route.apiDeploy.lambda.timeout    || _.cfg.apiDeploy.defaults.lambda.timeout,
                Runtime:        route.apiDeploy.lambda.runtime    || _.cfg.apiDeploy.defaults.lambda.runtime,
                Code: {
                    ZipFile: zip
                }
            };

        _.logger.log('Creating Lambda       - ' + route.operationId);

        async.series([
            function (next) {
                _.AWSLambda.createFunction(options, function(err, data) {
                    if (err) {
                        if (err.message.indexOf('exist') !== -1) {
                            err.hint = 'This Lambda `' + route.operationId + '` exists at AWS already. ';
                            err.hint += 'Add the ARN in the config file for `' + route.operationId + '` OR delete it from the AWS Console, then re-deploy.';
                        }
                    } else {
                        route.apiDeploy.lambda.arn = data.FunctionArn;
                        if (data.Role !== _.cfg.apiDeploy.defaults.lambda.role) route.role = data.Role;
                        _.logger.log('Created Lambda        - ' + route.operationId);
                    }

                    next(err, data);
                });
            }
        ], function (err, results) {
            if (err) return _.logger.error(err);
            done(null, results);
        });

    },

    updateLambda: function updateLambda(route, zip, done) {
        var _ = this;

        _.logger.log('Updating Lambda       - ' + route.operationId);

        async.series([
            function updateCode(next) {
                var options = {
                    FunctionName: route.apiDeploy.lambda.arn,
                    ZipFile: zip
                };

                _.AWSLambda.updateFunctionCode(options, function(err, data) {
                    if (err) {
                        err.hint = 'This Lambda `' + route.operationId + '` doesn\'t exist at AWS. Delete the ARN in the config file for `' + route.operationId + '` and re-deploy.';
                    } else {
                        _.logger.log('Updated Lambda Code   - ' + route.operationId);
                    }

                    next(err, data);
                });
            },
            function updateConfig(next) {
                var options = {
                    FunctionName:   route.apiDeploy.lambda.arn,
                    Description:    route.apiDeploy.lambda.description,
                    Handler:        Utils.prepPath(route.apiDeploy.lambda.handler, { joiner: '/' }) + '.handler',
                    MemorySize:     route.apiDeploy.lambda.memorySize || _.cfg.apiDeploy.defaults.lambda.memorySize,
                    Role:           route.apiDeploy.lambda.role       || _.cfg.apiDeploy.defaults.lambda.role,
                    Timeout:        route.apiDeploy.lambda.timeout    || _.cfg.apiDeploy.defaults.lambda.timeout
                };

                _.AWSLambda.updateFunctionConfiguration(options, function(err, data) {
                    if (!err) {
                        _.logger.log('Updated Lambda Config - ' + route.operationId);
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
