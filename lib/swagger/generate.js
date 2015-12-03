var fs = require('fs'),
    merge = require('../../utils/merge'),
    Finder = require('../../utils/finder'),
    ObjArr = require('../../utils/obj-arr'),
    Utils = require('../../utils');

module.exports = {
    readSwagger: function readSwagger() {
        var _ = this;

        try {
            return JSON.parse(
                fs.readFileSync(_.swagger.path)
            );
        } catch (e) {
            return {};
        }
    },

    saveSwagger: function saveSwagger(done) {
        var _ = this;

        _.logger.log('Swagger saving...');

        fs.writeFileSync(_.swagger.path, JSON.stringify(_.swagger.data, null, 4));

        _.logger.log('Swagger saved.');

        typeof done === 'function' && done();

        return _.swagger.data;
    },

    generateSwagger: function generateSwagger(options, done) {
        if (!options && !done || typeof options === 'function') {
            done = options;
            options = {};
        }

        var _ = this;

        _.logger.log('Swagger generating...');

        var swaggerData = _.readSwagger();

        _.swagger.data = {
            paths: {}
        };

        var resourceNames = Finder.generateResourcesAll(_.swagger.data, Object.keys(_.routes)),
            path, method, pluginName, pluginTemplate, plugin, formattedMethod;

        for (pluginName in _.plugins) {
            plugin = _.plugins[pluginName];
            plugin.beforeSwagger(resourceNames);
        }

        for (path in _.routes) {
            for (method in _.routes[path]) {
                method = method.toLowerCase();

                formattedMethod = {
                    operationId: Utils.dashedCamelCase(_.sdk.name + '-' + _.routes[path][method])
                };

                for (pluginName in _.plugins) {
                    plugin = _.plugins[pluginName];

                    if (plugin.swagger && plugin.swagger.template) {
                        pluginTemplate = _.handlebars.compile(plugin.swagger.template);
                        formattedMethod['x-' + pluginName] = JSON.parse(
                            pluginTemplate(
                                merge(plugin, {
                                    handler: _.routes[path][method]
                                })
                            )
                        );
                    }
                }

                _.swagger.data.paths[path] = _.swagger.data.paths[path] || {};
                _.swagger.data.paths[path][method] = formattedMethod;
            }
        }
        _.swagger.data = Utils.wrapSwagger(
            merge(_.swagger.data, swaggerData)
        );

        _.swagger.data.paths = ObjArr.create(
            _.swagger.data.paths
        ).sort(null, null, true);

        _.logger.log('Swagger generated.');

        _.saveSwagger();

        typeof done === 'function' && done(null, _.swagger.data);

        return _.swagger.data;
    }
};
