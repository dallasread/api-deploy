'use strict';

var async = require('async'),
    AWS = require('aws-sdk'),
    browserify = require('browserify'),
    async = require('async'),
    fs = require('fs'),
    Handlebars = require('handlebars'),
    Generator = require('generate-js'),
    Path = require('path'),
    Utils = require('./utils');

var APIDeploy = Generator.generate(function APIDeploy(configPath) {
    var _ = this;
    _.config(configPath);
    _.logger = Utils.logger;
});

APIDeploy.definePrototype({
    config: function config(configPath) {
        configPath = Path.resolve(configPath);

        var _ = this,
            cfg = require( configPath );

        if (cfg.aws.profile) {
            AWS.config.credentials = new AWS.SharedIniFileCredentials({
                profile: cfg.aws.profile
            });
        }

        AWS.config.update(cfg.aws);

        _.cfg = cfg;
        _.configPath = configPath;
        _.AWSLambda = new AWS.Lambda();

        return _;
    },

    deploy: function deploy(lambdaName, done) {
        var _ = this,
            routes = [];

        _.logger.log('Deploying Lambdas');

        if (lambdaName) {
            var route,
                routesLength = _.cfg.routes.length;

            for (var i = 0; i < routesLength; i++) {
                route = _.cfg.routes[i];

                if (route.lambda.name === lambdaName || route.lambda.arn === lambdaName) {
                    routes = [route];
                    break;
                }
            }

            if (!routes.length) {
                _.logger.error('Lambda not found `' + lambdaName + '`');
                return done();
            }
        } else {
            routes = _.cfg.routes;
        }

        async.each(routes, function(route, next) {
            _.deployLambda.call(_, route, next);
        }, function() {
            fs.writeFileSync(_.configPath, JSON.stringify(_.cfg, null, 4));
            _.logger.log('Deployed Lambdas');
            typeof done === 'function' && done();
        });
    },

    sdk: function sdk(done) {
        var _ = this,
            tmp = _.cfg.sdk.path + '.tmp',
            template = Handlebars.compile(
                fs.readFileSync(__dirname + '/templates/sdk.hbs', { encoding: 'utf8' })
            );

        _.logger.log('Building SDK');

        fs.writeFileSync(tmp, template(_.cfg));

        browserify({
            standalone: _.cfg.sdk.name,
            entries: [tmp]
        })
        .transform({
            global: true
        }, __dirname + '/node_modules/uglifyify')
        .bundle()
        .pipe(fs.createWriteStream(_.cfg.sdk.path))
        .on('finish', function sdkComplete() {
            fs.unlinkSync(tmp);
            _.logger.log('Built SDK');
            typeof done === 'function' && done();
        });
    }
});

APIDeploy.definePrototype(require('./lambda'));

module.exports = APIDeploy;
