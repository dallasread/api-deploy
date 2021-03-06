var Generator = require('generate-js'),
    merge = require('deepmerge'),
    Utils = require('./utils'),
    async = require('async');

var APIDeploy = Generator.generate(function APIDeploy() {
    var _ = this;

    _.defineProperties({
        plugins: {},
        logger: Utils.logger
    });

    _.defineProperties({
        writable: true
    }, {
        each: async.each
    });
});

APIDeploy.definePrototype({
    handlebars: Utils.handlebars,
    registerPlugin: function registerPlugin(plugin) {
        var _ = this;

        if (!plugin.name) throw new Error('Please supply a plugin name.');
        if (_.plugins[plugin.name]) console.warn('Plugin already exists. Overwriting: ' + plugin.name);

        for (var i = 0; i < (plugin.requires || []).length; i++) {
            if (!_.plugins[plugin.requires[i]]) {
                throw new Error('`' + plugin.name + '` is missing required plugin: `' + plugin.requires[i] + '`. Maybe change the order in which they are registered?');
            }
        }

        plugin.APIDeploy = _;

        plugin.defineProperties({
            writable: true,
            enumerable: true,
            configurable: true
        }, {
            sdk: merge(_.sdk || {}, plugin.sdk || {})
        });

        _.plugins[plugin.name] = plugin;

        return plugin;
    },
    deployAPI: function deployAPI(pluginName, args, options, done) {
        var _ = this,
            plugin = _.plugins[pluginName];

        options.pluginName = pluginName;

        if (plugin) {
            plugin._deployAPI(args, options, function(err, data) {
                done && done(err, data);
            });
        } else {
            throw new Error('No plugin found: ' + pluginName);
        }
    },
    generateSDK: function generateSDK(pluginName, args, options, done) {
        var _ = this,
            plugin = _.plugins[pluginName];

        options.pluginName = pluginName;

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
                resource: JSON.stringify({
                    'options': {}
                })
            }
        }, _.swagger || {});

        return _;
    }
});

APIDeploy.definePrototype(require('./lib/swagger/generate'));

module.exports = APIDeploy;
