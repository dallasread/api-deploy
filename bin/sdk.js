#!/usr/bin/env node

require(require('path').resolve('./deployfile.js'));

var deployer = require('/Users/dread/Apps/api-deploy'),
    argv = process.argv.slice(3),
    pluginName = process.argv[2],
    plugin = deployer.plugins[pluginName];

if (plugin) {
    var args = plugin.cliParser.parse(argv);
    if (args.error) throw args.error;
    deployer.generateSDK(pluginName, args.argv, args.options);
} else {
    console.error('No plugin found:', pluginName);
}
