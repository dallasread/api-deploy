var Utils = require('./utils'),
    fs = require('fs'),
    async = require('async'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-vinyl-zip'),
    UUID = require('uuid');

module.exports = {
    deployLambda: function deployLambda(route, done) {
        var _ = this,
            zipPath = './tmp/' + UUID.v1() + '.zip',
            path = route.lambda.code;

        route.lambda.name = route.lambda.name || Utils.prepPath(route.lambda.code, {
            prefix: _.cfg.sdk.name,
            humanize: true
        });

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
            fs.unlinkSync(zipPath);

            if (route.lambda.arn) {
                _.updateLambda(route, zip, done);
            } else {
                _.createLambda(route, zip, done);
            }
        });
    },

    createLambda: function createLambda(route, zip, done) {
        var _ = this,
            options = {
                FunctionName:   route.lambda.name,
                Description:    route.lambda.description,
                Handler:        Utils.prepPath(route.lambda.code, { joiner: '/' }) + '.handler',
                MemorySize:     route.lambda.memorySize || _.cfg.defaults.lambda.memorySize,
                Role:           route.lambda.role       || _.cfg.defaults.lambda.role,
                Timeout:        route.lambda.timeout    || _.cfg.defaults.lambda.timeout,
                Runtime:        route.lambda.runtime    || _.cfg.defaults.lambda.runtime,
                Code: {
                    ZipFile: zip
                }
            };

        _.logger.log('Creating Lambda       - ' + route.lambda.name);

        async.series([
            function (next) {
                _.AWSLambda.createFunction(options, function(err, data) {
                    if (err) {
                        if (err.message.indexOf('exist') !== -1) {
                            err.hint = 'This Lambda `' + route.lambda.name + '` exists at AWS already. ';
                            err.hint += 'Add the ARN in the config file for `' + route.lambda.name + '` OR delete it from the AWS Console, then re-deploy.';
                        }
                    } else {
                        route.lambda.arn = data.FunctionArn;
                        if (data.Role !== _.cfg.defaults.lambda.role) route.role = data.Role;
                        _.logger.log('Created Lambda        - ' + route.lambda.name);
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

        _.logger.log('Updating Lambda       - ' + route.lambda.name);

        async.series([
            function updateCode(next) {
                var options = {
                    FunctionName: route.lambda.arn,
                    ZipFile: zip
                };

                _.AWSLambda.updateFunctionCode(options, function(err, data) {
                    if (err) {
                        err.hint = 'This Lambda `' + route.lambda.name + '` doesn\'t exist at AWS. Delete the ARN in the config file for `' + route.lambda.name + '` and re-deploy.';
                    } else {
                        _.logger.log('Updated Lambda Code   - ' + route.lambda.name);
                    }

                    next(err, data);
                });
            },
            function updateConfig(next) {
                var options = {
                    FunctionName:   route.lambda.arn,
                    Description:    route.lambda.description,
                    Handler:        Utils.prepPath(route.lambda.code, { joiner: '/' }) + '.handler',
                    MemorySize:     route.lambda.memorySize || _.cfg.defaults.lambda.memorySize,
                    Role:           route.lambda.role       || _.cfg.defaults.lambda.role,
                    Timeout:        route.lambda.timeout    || _.cfg.defaults.lambda.timeout
                };

                _.AWSLambda.updateFunctionConfiguration(options, function(err, data) {
                    if (!err) {
                        _.logger.log('Updated Lambda Config - ' + route.lambda.name);
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
