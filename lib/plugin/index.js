var Generator = require('generate-js'),
    merge = require('deepmerge'),
    CommandLineParser = require('../../utils/command-line-parser');

var Plugin = Generator.generate(function Plugin(options) {
    var _ = this,
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
        }
    }

    if (!sdkFound) options.cli.push(['', 'sdk', 'Also generates an SDK for the given plugin.']);
    if (!prettifyFound) options.cli.push(['', 'prettify', 'Prettifies the generated SDK.']);
    if (!prettifyFound) options.cli.push(['', 'sdkTemplate[=ARG]', 'Set the template for the generated SDK.']);

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

        _.APIDeploy.logger.log('Deploying API: ', _.name);

        _.deployAPI(args, options, function() {
            _.APIDeploy.logger.log('Deployed API: ', _.name);

            if (options.sdk) {
                _._generateSDK(args, options, done);
            } else {
                done && done();
            }
        });
    },

    _generateSDK: function _generateSDK(args, options, done) {
        var _ = this;

        _.APIDeploy.logger.log('Generating SDK: ', _.name);

        _.generateSDK(args, options, function() {
            _.APIDeploy.logger.log('Generated SDK: ', _.name);
            done && done();
        });
    },

    templateData: function templateData() {
        var _ = this,
            data = merge(_, {
                methods: _.APIDeploy.methods
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
