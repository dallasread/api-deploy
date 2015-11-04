# API Deploy

API Deploy publishes your Amazon Lambda functions and exports a JS SDK to use on the Web & other Node apps. Your SDK and Lambdas are both built based on the `api.json` that you supply.

**API Deploy uses a very simple configuration file and builds a Swagger 2.0 spec. It then uses that document to deploy your API.**

## To use API Deploy, create it with a simple config:

First, you'll need to `npm i api-deploy`. Then:

```
var APIDeploy = require('api-deploy');

var deployer = APIDeploy.create({
    sdk: {
        path: './path/to/sdk' || ['./path/to/sdk'],
        name: 'MyAPI',
        url: 'https://api.api-deploy.com'
    },
    swagger: {
        path: './path/to/swagger'
    },
    routes: {
        '/accounts': {
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

```
var optionalArrayOfRoutes = [
    'accounts', // Deploys accounts and its children
    'accounts/auth', // Deploys just the auth route
    'arn:xxxxxx', // Deploys just this ARN
    'My-Swagger-operationId' // Deploys just this operationId
];

deployer.deploy(optionalArrayOfRoutes);
```

## If you only need to deploy to the APIGateway:

```
deployer.deployAPIGateway(optionalArrayOfRoutes || null);
```

## If you only need to deploy the Lambdas:

```
deployer.deployLambdas(optionalArrayOfRoutes || null);
```

## If you just want to generate new Swagger 2.0 docs:

```
deployer.generateSwagger();
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

Want to see our gulp file? [https://github.com/dallasread/api-deploy/tree/example-api/gulpfile.js](Here it is.)

## And... one more thing. To generate a JS SDK for Node/Browser use:

```
deployer.generateSDK();
```

## Want to see an example API?

[https://github.com/dallasread/api-deploy/tree/example-api](https://github.com/dallasread/api-deploy/tree/example-api)
