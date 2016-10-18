var fs = require('fs'),
    Path = require('path'),
    async = require('async'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    pluralize = require('pluralize'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    gulpUtil = require('gulp-util'),
    Finder = require('../../utils/finder'),
    nestedSet = require('../../utils/nested-set.js'),
    stringify = require('stringify');

function lambdaPath(path) {
    return path
        .replace(/^[\.\/]+/g, '')
        .replace(/\.js$/, '') +
        '.handler';
}

function applyLambdasToSwagger(swagger, lambdas) {
        var lambda, path, method, i, m;

        for (i = lambdas.length - 1; i >= 0; i--) {
            lambda = lambdas[i];

            for (path in swagger.paths) {
                for (method in swagger.paths[path]) {
                    m = swagger.paths[path][method];

                    if (m.operationId === lambda.FunctionName && !isDeployed(m)) {
                        nestedSet(m, 'x-lambda.arn', lambda.FunctionArn);
                    }
                }
            }
        }
    }

function isDeployed(method) {
    return method['x-lambda'] && method['x-lambda'].arn && !!method['x-lambda'].arn.length;
}

module.exports = {
    deployLambdaPlugin: function deployLambdaPlugin(args, options, done) {
        var _ = this;

        async.series([
            function getLambdas(next) {
                _.AWSLambda.listFunctions({
                    MaxItems: 500
                }, function(err, lambdas) {
                    if (err) return next(err);

                    applyLambdasToSwagger(_.APIDeploy.swagger.data, lambdas.Functions);

                    next();
                });
            },
            function deployLambdas(next) {
                _.deployLambdas(args, options, next);
            }
        ], function(err) {
            done();
        });
    },

    getLambdas: function getLambdas(done) {
        var _ = this;

        _.AWSLambda.listFunctions({
            MaxItems: 500
        }, done);
    },

    deployLambdas: function deployLambdas(args, options, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying to Lambda...');

        var swaggerData = _.APIDeploy.swagger.data,
            deployable = Finder.getAllResourcesToDeploy(swaggerData, args.length ? args : ['/']),
            methods = deployable.methods.filter(function(item) {
                if (item['x-lambda']) return item;
            });

        _.APIDeploy.logger.log('Deploying ' + methods.length + ' ' + pluralize('Lambda', methods.length));

        _.APIDeploy.each(methods, function deploySelectedLambdas(method, next) {
            _.deployLambda(method, next);
        }, function deployedSelectedLambdas() {
            var deployedCount = methods.filter(function(method) { return method.deployed; }).length;

            _.APIDeploy.logger.succeed('Deployed ' + deployedCount + ' ' + pluralize('Lambda', deployedCount) + '.');

            done();
        });
    },

    deployLambda: function deployLambda(method, done) {
        var _ = this,
            globalModules = _.lambda.node_modules,
            modules = method['x-lambda'].node_modules || [];

        if (globalModules && globalModules.length) {
            for (var i = globalModules.length - 1; i >= 0; i--) {
                if (modules.indexOf(globalModules[i]) === -1) {
                    modules.push(globalModules[i]);
                }
            }
        }

        _.APIDeploy.logger.log('Compiling Lambda:', method.pathInfo);

        var tmpPath = './tmp/' + method.operationId,
            zipPath = tmpPath + '.zip',
            jsPath = tmpPath + '.js',
            jsBaseDir = Path.basename(jsPath),
            jsFileName = Path.dirname(jsPath);

        browserify({
            standalone: 'handler',
            bare: true,
            browserField: false,
            builtins: false,
            commondir: false,
            detectGlobals: false,
            igv: '__filename,__dirname'
        })
        .transform(stringify, {
          appliesTo: { includeExtensions: ['.txt', '.html', '.bars', '.hbs'] }
        })
        .add(method['x-lambda'].handler)
        .exclude('aws-sdk')
        .bundle()
        .pipe(source(method['x-lambda'].handler))
        .pipe(buffer())
        .pipe(uglify(_.uglify || {}).on('error', gulpUtil.log))
        .pipe(rename(jsBaseDir))
        .pipe(gulp.dest(jsFileName))
        .on('end', function zipComplete() {
            var fs = require('fs'),
                archiver = require('archiver'),
                zip = fs.createWriteStream(zipPath),
                zipArchive = archiver('zip');

            zipArchive.pipe(zip);

            zipArchive.append(fs.readFileSync(jsPath), { name: 'index.js' });

            zipArchive.bulk([
                {
                    src: modules.map(function(d) {
                        return d + '/**/*';
                    }),
                    dest: 'node_modules/',
                    cwd: './node_modules',
                    expand: true
                }
            ]);

            zip.on('close', function() {
                zip = fs.readFileSync(zipPath);

                method.setHidden('deployed', false);

                // fs.unlinkSync(zipPath);

                if (isDeployed(method)) {
                    _.updateLambda(method, zip, function(err, data) {
                        if (err) _.APIDeploy.logger.warn(err);
                        done(null, data);
                    });
                } else {
                    _.createLambda(method, zip, function(err, data) {
                        if (err) _.APIDeploy.logger.warn(err);
                        done(null, data);
                    });
                }
            });

            zipArchive.finalize(function(err, bytes) {
                if (err) throw err;
            });
        });
    },

    createLambda: function createLambda(method, zip, done) {
        var _ = this,
            lambda = method['x-lambda'],
            defaultLambda = _.lambda,
            options = {
                FunctionName:   method.operationId,
                Description:    lambda.description,
                Handler:        'index.handler',
                MemorySize:     lambda.memorySize || defaultLambda.memorySize,
                Role:           lambda.role       || defaultLambda.role,
                Timeout:        lambda.timeout    || defaultLambda.timeout,
                Runtime:        lambda.runtime    || defaultLambda.runtime,
                Code: {
                    ZipFile: zip
                }
            };

        _.APIDeploy.logger.log('Creating Lambda:', method.pathInfo);

        _.AWSLambda.createFunction(options, function(err, data) {
            if (err) {
                if (err.message.indexOf('exist') !== -1) {
                    err.hint = 'Add the ARN in the config file for `' + method.operationId + '` OR delete it from the AWS Console, then re-deploy.';
                }
            } else {
                method.setHidden('deployed', true);
                lambda.arn = data.FunctionArn;
                if (data.Role !== defaultLambda.role) lambda.role = data.Role;
                _.APIDeploy.logger.succeed('Created Lambda:', method.pathInfo);
            }

            done(err, data);
        });
    },

    updateLambda: function updateLambda(method, zip, done) {
        var _ = this,
            defaultLambda = _.lambda;

        var lambda = method['x-lambda'];

        _.APIDeploy.logger.log('Updating Lambda:', method.pathInfo);

        async.series([
            function updateCode(next) {
                var options = {
                    FunctionName: lambda.arn,
                    ZipFile: zip
                };

                _.AWSLambda.updateFunctionCode(options, function(err, data) {
                    if (err) {
                        err.hint = 'Delete the ARN in the config file for `' + method.operationId + '` and re-deploy.';
                    } else {
                        _.APIDeploy.logger.log('Updated Lambda Code:', method.pathInfo);
                    }

                    setTimeout(next(err, data), 1000);
                });
            },
            function updateConfig(next) {
                var options = {
                    FunctionName:   lambda.arn,
                    Description:    lambda.description,
                    Handler:        'index.handler',
                    MemorySize:     lambda.memorySize || defaultLambda.memorySize,
                    Role:           lambda.role       || defaultLambda.role,
                    Timeout:        lambda.timeout    || defaultLambda.timeout,
                    Runtime:        lambda.runtime    || defaultLambda.runtime
                };

                _.AWSLambda.updateFunctionConfiguration(options, function(err, data) {
                    if (!err) {
                        _.APIDeploy.logger.log('Updated Lambda Config:', method.pathInfo);
                    }

                    next(err, data);
                });
            }
        ], function (err, results) {
            if (!err) {
                method.setHidden('deployed', true);
                _.APIDeploy.logger.succeed('Updated Lambda:', method.pathInfo);
            }

            done(err, results);
        });
    }
};
