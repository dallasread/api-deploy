# API Deploy

API Deploy publishes your Amazon Lambda functions and exports a JS SDK to use on the Web & other Node apps. Your SDK and Lambdas are both built based on the `api.json` that you supply.

## Working With Lambdas

### How to Deploy to Amazon Lambda

```
var APIDeploy = require('api-deploy').create('./path/to/api.json');
APIDeploy.deploy();
```

OR

```
// First arg accepts ARN or name of Lambda.
// When null, all Lambdas will be deployed.
APIDeploy.deploy('MyLambda', function() {
    console.log('Done deploying!');
});
```

### A Sample `api.json`

`api.json` is expected to be in the Swagger 2.0 format. Here are the relevant bits:

```
{
    "swagger": "2.0",
    "apiDeploy": {
        "defaults": {
            "aws": {
                "profile": "personal", // If you have a ~/.aws file, just use your profile instead of the following credentials
                "accessKeyId": "", // Amazon credentials
                "secretAccessKey": "", // Amazon credentials
                "region": "us-east-1", // Amazon credentials
                "IdentityPoolId": "aaaaaaaaaaaaa" // Passed along into the generated SDK
            },
            "lambda": {
                "memorySize": 128,
                "role": "arn:aws:iam::1234567845678:role/Lambda", // Must be created in the AWS Console (IAM)
                "runtime": "nodejs",
                "timeout": 60
            }
        },
        "sdk": {
            "name": "MyAwesomeApp", // The SDK's namespace on window
            "path": "./sdk.js", // The output file of the SDK
            "method": "apiGateway" // Or `lambda` (which requires the Amazon SDK to be present)
        }
    },
    "paths": {
        "/users": { // Irrelevant for now, but will eventually integrate with the API Gateway
            "post": { // Also only relevant with API Gateway integration
                "apiDeploy": {
                    "lambda": {
                        "handler": "./users/create" // Path to the code for this function, must export `handler`
                    },
                    "sdk": {
                        "method": "usersCreate" // Namespace for this Lambda in the SDK
                    }
                }
            }
        }
    }
}
```

## Plays nice with Gulp - a sample gulpfile

```
var gulp = require('gulp'),
    argv = require('yargs').argv,
    APIDeploy = require('/Users/dread/Apps/api-deploy').create('./api.json');

// `gulp api-sdk` task that generates the SDK.
gulp.task('api-sdk', function(done) {
    APIDeploy.sdk(done);
});

// `gulp api-deploy` task that deploys your Lambdas.
gulp.task('api-deploy', function(done) {
    APIDeploy.deploy(argv.name, done);
});
```

## Working with SDKs

### How to Generate an SDK

```
var APIDeploy = require('api-deploy').create('./path/to/api.json');
APIDeploy.sdk(function() {
    console.log('Done creating the SDK!');
});
```

### How to Use the SDK

```
// If you're in Node, you can also `require` these instead.
<script src="/path/to/amazon-sdk"></script>
<script src="/path/to/your/built/sdk"></script>

MyAwesomeApp.usersCreate(inputData, function(err, data) {
    console.log(err, data);
});
```

## TODO
- Better zipping for Lambdas
- API Gateway integration
