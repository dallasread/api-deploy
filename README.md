# API Deploy

API Deploy publishes your Amazon Lambda functions and exports a JS SDK to use on the Web & other Node apps. Your SDK and Lambdas are both built based on the `api.json` that you supply.

**API Deploy uses a very simple configuration file and builds a Swagger 2.0 spec. It then uses that document to deploy your API.**

## To use API Deploy, create it with a simple config:

First, you'll need to `npm i api-deploy`. Then:

```
var APIDeploy = require('api-deploy');

var deployer = APIDeploy.create({
    sdk: {
        path: './path/to/sdk' || ['./path/to/sdk', './path/to/sdk/copy'],
        name: 'MyAPI',
        url: 'https://api.api-deploy.com'
    },
    swagger: {
        path: './path/to/swagger/document'
    },
    routes: {
        '/accounts/create': {
            'post': './path/to/handler'
        }
    },
    defaults: {
        lambda: {
            role: 'arn:aws:iam::xxxxxxxxxxxxxxxx'
        },
        aws: {
            region: 'us-east-1',
            profile: 'personal'
        }
    }
});
```

## To deploy your API:

```
deployer.deploy();
```

What does this actually do?

- generateSwagger
- deployAPIGateway
- deployLambdas
- generateSDK

## If you only need to deploy selected routes:

If any of the following match, we'll deploy them, along with their children.

```
var optionalArrayOfRoutes = [
    'accounts', // Deploys accounts and its children
    'accounts/auth', // Deploys just the auth route
    'arn:xxxxxx', // Deploys just this ARN
    'My-Swagger-operationId' // Deploys just this operationId
];

deployer.deploy(optionalArrayOfRoutes, optionalCallback);
```

## If you only need to deploy to the APIGateway:

```
deployer.deployAPIGateway(optionalArrayOfRoutes || null, optionalCallback);
```

## If you only need to deploy the Lambdas:

```
deployer.deployLambdas(optionalArrayOfRoutes || null, optionalCallback);
```

## If you just want to generate new Swagger 2.0 docs:

```
deployer.generateSwagger({
    regeneratePaths: false // Dangerous! Replaces the entire `paths` object
}, optionalCallback);
```

## Gulp integration couldn't be simpler:

Yes, this could be your entire gulp file.

```
var gulp = require('gulp'),
    deployer = require('api-deploy').create({ /* YourConfigHere */ });

deployer.registerTasks(gulp);

// Now, you can run:
// - `gulp api-deploy`
// - `gulp generate-sdk`
// - `gulp deploy-lambdas`
// - `gulp generate-swagger`
// - `gulp api-deploy --name /accounts`
// - `gulp api-deploy --name operationId`
// - `gulp deploy-lambdas --name /accounts`
```

Want to see our gulp file? [Here it is.](https://github.com/dallasread/api-deploy/tree/master/example-api/gulpfile.js)

## And... one more thing.

```
deployer.generateSDK();
```

## This will give you a Node/Browser JS SDK:

```
MyAPI.accountsCreate(data, function(err, data) {
    console.log('Response from Lambda/ApiGateway', err, data);
});
```

## Want to see an example API?

[https://github.com/dallasread/api-deploy/tree/master/example-api](https://github.com/dallasread/api-deploy/tree/master/example-api)
