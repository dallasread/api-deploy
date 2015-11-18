var Generator = require('generate-js'),
    merge = require('deepmerge'),
    Utils = require('./utils');

var APIDeploy = Generator.generate(function APIDeploy() {
    var _ = this;

    _.defineProperties({
        plugins: {},
        logger: Utils.logger
    });
});

APIDeploy.definePrototype({
    handlebars: Utils.handlebars,
    registerPlugin: function registerPlugin(plugin) {
        var _ = this;

        if (!plugin.name) throw new Error('Please supply a plugin name.');
        if (_.plugins[plugin.name]) console.warn('Plugin already exists. Overwriting: ' + plugin.name);

        plugin.APIDeploy = _;

        plugin.defineProperties({
            writable: true,
            enumerable: true,
            configurable: true
        }, {
            sdk: merge(_.sdk || {}, plugin.sdk || {})
        });

        _.plugins[plugin.name] = plugin;
    },
    deployAPI: function deployAPI(pluginName, args, options, done) {
        var _ = this,
            plugin = _.plugins[pluginName];

        if (plugin) {
            plugin._deployAPI(args, options, function(err, data) {
                _.saveSwagger();
                done && done(err, data);
            });
        } else {
            throw new Error('No plugin found: ' + pluginName);
        }
    },
    generateSDK: function generateSDK(pluginName, args, options, done) {
        var _ = this,
            plugin = _.plugins[pluginName];

        if (plugin) {
            plugin._generateSDK(args, options, done);
        } else {
            throw new Error('No plugin found: ' + pluginName);
        }
    },
    configure: function configure(options) {
        var _ = this;

        _.defineProperties({
            writable: true,
            enumerable: true,
            configurable: true
        }, options);

        _.sdk = _.sdk || {};
        _.swagger = _.swagger || {};
        _.swagger.data = _.readSwagger();

        _.sdk = merge({
            path: './sdk.js'
        }, _.sdk || {});

        _.swagger = merge({
            path: './swagger.json',
            templates: {
                resource: JSON.stringify(
                    require('./lib/swagger/templates/resource.json')
                )
            }
        }, _.swagger || {});

        return _;
    }
});

APIDeploy.definePrototype(require('./utils/aws-request'));
APIDeploy.definePrototype(require('./utils/find'));
APIDeploy.definePrototype(require('./lib/swagger/generate'));

module.exports = APIDeploy;
