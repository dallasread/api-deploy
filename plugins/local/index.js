var Plugin = require('../../lib/plugin'),
    nodemon = require('nodemon'),
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
        ['t', 'template[=ARG]', 'Set a path to the template.'],
        ['s', 'serve', 'Serve the local server.'],
        ['w', 'watch', 'Watch and reload on local server changes.']
    ],
    deployAPI: function deployAPI(args, options, done) {
        var _ = this,
            template = _.APIDeploy.handlebars.compile(
                fs.readFileSync(options.template || _.local.template, { encoding: 'utf8' })
            ),
            path = (options.path && require('path').resolve(options.path)) || _.local.path;

        _.APIDeploy.logger.log('Building Local Server');

        _.APIDeploy.findMethods();

        fs.writeFileSync(
            path,
            template(_.templateData())
        );

        _.APIDeploy.logger.log('Built Local Server');

        done();

        if (options.serve) {
            _.APIDeploy.logger.log('Starting Local Server');

            if (options.watch) {
                _.APIDeploy.logger.log('Watching Local Server');

                nodemon({
                    script: path
                });
            } else {
                require('child_process').fork(path);
            }
        }
    }
});
