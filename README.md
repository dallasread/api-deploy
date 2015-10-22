# API Deploy

API Deploy publishes your Amazon Lambda functions and exports a JS SDK to use on the Web. Your SDK and Lambdas are both built based on the `config.json` that you supply.

## How to Deploy to Amazon Lambda

```
var APIDeploy = require('api-deploy').create('./path/to/config.json');
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

## How to Generate an SDK

```
var APIDeploy = require('api-deploy').create('./path/to/config.json');
APIDeploy.sdk(function() {
    console.log('Done creating the SDK!');
});
```

## A Sample Config.json

```
{
    "defaults": {
        "lambda": {
            "memorySize": 128,
            "role": "arn:aws:iam::1234567845678:role/Lambda", // Must be created in the AWS Console (IAM)
            "runtime": "nodejs",
            "timeout": 60
        }
    },
    "aws": {
        "profile": "personal", // If you have a ~/.aws file, just use your profile
        "accessKeyId": "", // Amazon credentials
        "secretAccessKey": "", // Amazon credentials
        "region": "us-east-1"
    },
    "sdk": {
        "name": "MyAwesomeApp", // The SDK's namespace on window
        "path": "./sdk.js" // The output file of the SDK
    },
    "routes": [
        {
            "lambda": {
                "code": "./users/create" // Path to the code for this function, must export `handler`
            },
            "sdk": {
                "method": "usersCreate" // Namespace for this Lambda in the SDK
            }
        }
    ]
}
```

## Plays nice with Gulp - a sample gulpfile

```
var gulp = require('gulp'),
    argv = require('yargs').argv,
    APIDeploy = require('/Users/dread/Apps/api-deploy').create('./config.json');

// `gulp api-sdk` task that generates the SDK.
gulp.task('api-sdk', function(done) {
    APIDeploy.sdk(done);
});

// `gulp api-deploy` task that deploys your Lambdas.
gulp.task('api-deploy', function(done) {
    APIDeploy.deploy(argv.name, done);
});
```
