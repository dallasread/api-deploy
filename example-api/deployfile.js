var deployer = require('../').configure({
    sdk: {
        url: 'http://my-api.com',
        name: 'MySampleAPI'
    },
    swagger: {
        path: './swagger.json'
    },
    routes: require('./routes.json')
});

var pluginConfig = {
        lambda: {
            role: 'arn:aws:iam::xxxxxxxxxxxx:role/Lambda'
        },
        aws: {
            region: 'us-east-1',
            profile: 'default'
        },
        apigateway: {
            // cors: false
        }
    };

require('api-deploy/plugins/local').register(deployer).configure(pluginConfig);
require('api-deploy/plugins/lambda').register(deployer).configure(pluginConfig);
require('api-deploy/plugins/apigateway').register(deployer).configure(pluginConfig);

module.exports = deployer;
