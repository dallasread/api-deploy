var Generator = require('generate-js'),
    merge = require('deepmerge'),
    async = require('async'),
    Finder = require('../../utils/finder'),
    CommandLineParser = require('../../utils/command-line-parser');

var Plugin = Generator.generate(function Plugin(options) {
    var _ = this,
        seriesFound = false,
        sdkFound = false,
        sdkTemplateFound = false,
        prettifyFound = false;

    options.cli = options.cli || [];

    _.defaults = _.defaults || {};

    for (var i = 0; i < options.cli.length; i++) {
        if (options.cli[i][1] === 'sdk') {
            sdkFound = true;
        } else if (options.cli[i][1] === 'sdkTemplate') {
            sdkTemplateFound = true;
        } else if (options.cli[i][1] === 'prettify') {
            prettifyFound = true;
        } else if (options.cli[i][1] === 'series') {
            seriesFound = true;
        }
    }

    if (!seriesFound) options.cli.push(['', 'series', 'Executes deploys in series (slower, but cleaner logs).']);
    if (!sdkFound) options.cli.push(['', 'sdk', 'Generates an SDK for the given plugin.']);
    if (!prettifyFound) options.cli.push(['', 'prettify', 'Prettifies the generated SDK.']);
    if (!sdkTemplateFound) options.cli.push(['', 'sdkTemplate[=ARG]', 'Set the template for the generated SDK.']);

    _.cliParser = CommandLineParser.create(options.cli);
    _.defineProperties(options);
    _.configure({});
});

Plugin.definePrototype({
    deployAPI: function deployAPI(args, options, done) {
        done();
    },

    configure: function configure(options) {
        var _ = this;

        _.defineProperties({
            writable: true,
            enumerable: true,
            configurable: true
        }, merge(_.defaults, options));

        _.APIDeploy && _.defineProperties({
            writable: true,
            enumerable: true,
            configurable: true
        }, {
            sdk: merge(_.APIDeploy.sdk, _.sdk)
        });

        _.afterConfigure();

        return _;
    },

    afterConfigure: function afterConfigure() { },

    _deployAPI: function _deployAPI(args, options, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying API:', _.name);

        if (options.series) _.APIDeploy.each = async.eachSeries;

        _.swagger = _.swagger || {};
        _.swagger.data = _.APIDeploy.generateSwagger();

        _.deployAPI(args, options, function() {
            _.APIDeploy.logger.succeed('Deployed API:', _.name);

            if (options.sdk) {
                _._generateSDK(args, options, done);
            } else {
                done && done();
            }
        });
    },

    _generateSDK: function _generateSDK(args, options, done) {
        var _ = this;

        _.swagger = _.swagger || {};
        _.swagger.data = _.APIDeploy.generateSwagger();

        _.APIDeploy.logger.log('Generating SDK:', _.name);

        _.generateSDK(args, options, function() {
            _.APIDeploy.logger.succeed('Generated SDK:', _.name);
            done && done();
        });
    },

    templateData: function templateData() {
        var _ = this,
            deployable = Finder.getAllResourcesToDeploy(_.APIDeploy.swagger.data, ['/']),
            data = merge(_, {
                methods: deployable.methods
            });

        return data;
    }
});

Plugin.definePrototype(require('./sdk/generate'));

module.exports = Plugin;

// var Plugin = require('api-deploy/plugin');
//
// Plugin.create({
//     defaults: {
//         memorySize: 128,
//         role: null,
//         timeout: 60,
//         runtime: 'nodejs',
//     },
//     sdkTemplate:
//     deployAPI: function deployAPI() {
//         var _ = this;
//
//
//     }
// });
