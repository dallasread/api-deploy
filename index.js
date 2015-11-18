var deployer = require('./deployer').create();

deployer.registerPlugin( require('./plugins/lambda') );
deployer.registerPlugin( require('./plugins/local') );
deployer.registerPlugin( require('./plugins/apigateway') );

module.exports = deployer;
