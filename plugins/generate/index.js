var Plugin = require('../../lib/plugin');

var Generate = module.exports = Plugin.create({
    name: 'generate',
    defaults: {},
    cli: [
        // ['r', 'routes[=ARG+]', 'Set the routes you wish to deploy']
    ],
    deployAPI: function deployAPI(args, options, done) { },
    afterConfigure: function afterConfigure() { }
});

Generate.defineProperties(require('./deploy'));
