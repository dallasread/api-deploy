var deployer = require('api-deploy').configure({
    sdk: {
        url: 'http://my-api.com',
        name: 'MySampleAPI'
    },
    swagger: {
        path: './swagger.json'
    },
    routes: require('./routes.json')
});

var awsDefaults = {
        lambda: {
            role: 'arn:aws:iam::xxxxxxxxxxxx:role/Lambda'
        },
        aws: {
            region: 'us-east-1',
            profile: 'default'
        }
    };

deployer.plugins.lambda.configure(awsDefaults);
deployer.plugins.local.configure(awsDefaults);
deployer.plugins.apigateway.configure(awsDefaults);

module.exports = deployer;
