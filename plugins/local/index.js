var Plugin = require('../../lib/plugin'),
    fs = require('fs');

module.exports = Plugin.create({
    name: 'local',
    defaults: {
        sdk: {
            url: 'http://localhost:8000',
            path: './sdk.js'
        },
        local: {
            template: __dirname + '/templates/hapi.hbs',
            path: './local.js',
            host: 'localhost',
            port: 8000,
        }
    },
    cli: [
        ['t', 'template[=ARG]', 'Set a path to the template.']
    ],
    deployAPI: function deployAPI(args, options, done) {
        var _ = this,
            template = _.APIDeploy.handlebars.compile(
                fs.readFileSync(options.template || _.local.template, { encoding: 'utf8' })
            );

        _.APIDeploy.logger.log('Building Local Server');

        _.APIDeploy.findMethods();

        fs.writeFileSync(
            (options.path && require('path').resolve(options.path)) || _.local.path,
            template(_.templateData())
        );

        _.APIDeploy.logger.log('Built Local Server');

        done();
    }
});
