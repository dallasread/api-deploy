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

    saveSwagger: function saveSwagger() {
        var _ = this;
        fs.writeFileSync(_.swagger.path, JSON.stringify(_.swagger.data, null, 4));
    },

    generateSwagger: function generateSwagger(options, done) {
        if (!options && !done || typeof options === 'function') {
            done = options;
            options = {};
        }

        var _ = this,
            template = _.handlebars.compile(_.defaults.templates.swagger.resource),
            path, route, method, obj;

        if (options.regeneratePaths) {
            _.swagger.data.paths = {};
        }

        for (path in _.routes) {
            route = _.routes[path];

            for (method in _.routes[path]) {
                try {
                    obj = JSON.parse(template({
                        path: path,
                        method: method,
                        handler: _.routes[path][method],
                        defaults: _.defaults
                    }));
                } catch (e) {
                    _.logger.error(e);
                    obj = {};
                }

                _.swagger.data = merge(obj, _.swagger.data);
            }
        }

        _.saveSwagger();

        typeof done === 'function' && done(null, _.swagger.data);

        return _.swagger.data;
    }
};
