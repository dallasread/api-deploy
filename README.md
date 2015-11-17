# API Deploy

API Deploy publishes your Amazon Lambda functions and exports a JS SDK to use on the Web & other Node apps. Your SDK and Lambdas are both built based on the `api.json` that you supply.

**API Deploy uses a very simple configuration file to build a Swagger 2.0 spec. It then uses that document to deploy your API.**

## To use API Deploy, create it with a simple config:

First, you'll need to `npm install api-deploy -g`. Then create a `deployfile.js` in your project:

```
var deployer = require('api-deploy').configure({
    sdk: {
        name: 'MyAPI',
        path: './sdk.js',
        url: 'http://myapi.com'
    },
    swagger: {
        path: './swagger.json'
    },
    routes: {
        '/accounts': {
            'post': './accounts/create.js'
        }
    }
});

var deployDefaults = {
    lambda: {
        role: 'arn:aws:iam::xxxxxxxxxx:role/root'
    },
    aws: {
        profile: config.aws.profile,
        region: 'us-east-1',
        IdentityPoolId: 'xxxxx'
    }
};

deployer.plugins.lambda.configure(deployDefaults);
deployer.plugins.local.configure(deployDefaults);

```

## Now, you can run commands like:

- `generate-sdk lambda`
- `generate-sdk local`
- `generate-sdk local --prettify`
- `api-deploy lambda`
- `api-deploy lambda /route/1 /other {operationId}`
- `api-deploy lambda --sdk --prettify`

## This will give you a Node/Browser JS SDK:

```
MyAPI.accountsCreate(data, [headers], function(err, data) {
    console.log('Response from Lambda/ApiGateway', err, data);
});
```

## Want to see an example API?

[https://github.com/dallasread/api-deploy/tree/master/example-api](https://github.com/dallasread/api-deploy/tree/master/example-api)
