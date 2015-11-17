var APIDeploy = require('./api-deploy'),
    deployer = APIDeploy.create();

deployer.registerPlugin( require('./plugins/lambda') );
deployer.registerPlugin( require('./plugins/local') );

module.exports = deployer;
