var Generator = require('generate-js'),
    Utils = require('./lib/utils'),
    handlebars = Utils.handlebars,
    merge = require('deepmerge');

var APIDeploy = Generator.generate(function APIDeploy(options) {
    var _ = this;

    _.defineProperties({
        handlebars: handlebars
    });

    _.defineProperties({
        writable: true
    }, {
        logger: options.logger || Utils.logger,
        defaults: merge(
            {
                uglify: {},
                lambda: {},
                aws: {},
                templates: {
                    swagger: {
                        resource: JSON.stringify(
                            require('./lib/swagger/templates/resource')
                        )
                    }
                }
            },
            options.defaults || {}
        )
    });

    delete options.defaults;

    _.defineProperties({
        writable: true,
        enumerable: true
    }, options);
});

APIDeploy.definePrototype(require('./lib/swagger/generate'));
APIDeploy.definePrototype(require('./lib/lambdas/deploy'));
APIDeploy.definePrototype(require('./lib/methods/get'));

// APIDeploy.definePrototype(require('./lib/config'));
// APIDeploy.definePrototype(require('./lib/api-gateway'));
// APIDeploy.definePrototype(require('./lib/api-endpoint'));
// APIDeploy.definePrototype(require('./lib/deploy'));
// APIDeploy.definePrototype(require('./lib/sdk'));

module.exports = APIDeploy;
