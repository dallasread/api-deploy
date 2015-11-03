# API Deploy

API Deploy publishes your Amazon Lambda functions and exports a JS SDK to use on the Web & other Node apps. Your SDK and Lambdas are both built based on the `api.json` that you supply.

**API Deploy uses a very simple configuration file and builds a Swagger 2.0 spec. It then uses that document to deploy your API.**

## To use API Deploy, create it with a simple config:

```
var deployer = APIDeploy.create({
    sdk: {
        path: './path/to/sdk' || ['./path/to/sdk'],
        name: 'MyAPI'
    },
    swagger: {
        path: './path/to/swagger'
    },
    routes: {
        '/accounts': {
            'post': './path/to/handler'
        }
    }
});
```

## You can update these options later:

```
deployer.routes = newRoutesObject;
deployer.sdk = newSDKObject;
deployer.swagger = newSwaggerObject;
```

## To deploy your API:

```
// What does it do?
// - generateSwagger
// - deployAPIGateway
// - deployLambdas
// - generateSDK

deployer.deploy();
```

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
// What does it do?
// - if routes supplied, update swagger
// - Find routeNames (or do all of them)
// - Deploy appropriate endpoints

deployer.deployAPIGateway(optionalArrayOfRoutes || null);
```

## If you only need to deploy the Lambdas:

```
// What does it do?
// - if routes supplied, update swagger
// - Find routeNames (or do all of them)
// - Deploy appropriate lambdas

deployer.deployLambdas(optionalArrayOfRoutes || null);
```

## If you just want to generate new Swagger 2.0 docs:

```
deployer.generateSwagger();
```

## Every method plays nice with gulp:

For gulp build synchronicity, pass a `done` in as the last argument of any method call.

```
var gulp = require('gulp'),
    argv = require('yargs').argv,
    deployer = require('api-deploy').create({ /* YourConfigHere */ });

gulp.task('deploy', function(done) {
    deployer.deploy(argv.name, done);
});
```

## And... one more thing. To generate an SDK:

```
// What does it do?
// - generateSwagger
// - readSwagger
// - writeToSDKPath

deployer.generateSDK();
```

##
