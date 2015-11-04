var fs = require('fs'),
    merge = require('deepmerge');

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

    generateSwagger: function generateSwagger(options, done) {
        if (!options && !done || typeof options === 'function') {
            done = options;
            options = {};
        }

        var _ = this,
            swagger = _.readSwagger(),
            template = _.handlebars.compile(_.defaults.templates.swagger.resource),
            path, route, method, obj;

        if (options.regeneratePaths) {
            swagger.paths = {};
        }

        for (path in _.routes) {
            route = _.routes[path];

            for (method in _.routes[path]) {
                try {
                    obj = {
                        paths: JSON.parse(template({
                            path: path,
                            method: method,
                            handler: _.routes[path][method],
                            defaults: _.defaults
                        }))
                    };
                } catch (e) {
                    _.logger.error(e);
                    obj = {};
                }

                swagger = merge(obj, swagger);
            }
        }

        fs.writeFileSync(_.swagger.path, JSON.stringify(swagger, null, 2));

        typeof done === 'function' && done(null, swagger);

        return swagger;
    }
};
