#!/usr/bin/env node

var deployer = require(require('path').resolve('./deployfile.js')),
    argv = process.argv.slice(4),
    pluginName = process.argv[3],
    action = process.argv[2],
    plugin = deployer.plugins[pluginName];

if (plugin) {
    var args = plugin.cliParser.parse(argv);
    if (args.error) throw args.error;

    switch (action) {
    case 'deploy':
        deployer.deployAPI(pluginName, args.argv, args.options);
        break;
    case 'sdk':
        deployer.generateSDK(pluginName, args.argv, args.options);
        break;
    }
} else {
    console.error('No plugin found:', pluginName);
}
