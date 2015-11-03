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
        templates: merge({
            swagger: {
                resource: JSON.stringify(
                    require('./lib/swagger/templates/resource')
                )
            }
        }, options.templates || {})
    });

    delete options.templates;

    _.defineProperties({
        writable: true,
        enumerable: true
    }, options);
});

APIDeploy.definePrototype(require('./lib/swagger/generate'));

// APIDeploy.definePrototype(require('./lib/config'));
// APIDeploy.definePrototype(require('./lib/lambda'));
// APIDeploy.definePrototype(require('./lib/api-gateway'));
// APIDeploy.definePrototype(require('./lib/api-endpoint'));
// APIDeploy.definePrototype(require('./lib/deploy'));
// APIDeploy.definePrototype(require('./lib/sdk'));

module.exports = APIDeploy;
