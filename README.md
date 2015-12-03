# API Deploy

API Deploy is a Command Line Tool to publish your API. Currently, AWS Lambda is implemented, with API Gateway on the way. You can also export an SDK to use on the Web or Node (more platforms to come). Your SDK and Lambdas are both built based your project's `deployfile.js`.

**API Gateway integration is coming soon!**

## To use API Deploy:

First, you'll need to `npm install api-deploy -g`. This gives you a new terminal command: `api`. Now, create a `deployfile.js` in your project:

```
var deployer = require('api-deploy').configure({
    sdk: {
        name: 'MyAPI',
        url: 'http://myapi.com'
    },
    swagger: {
        path: './swagger.json'
    },
    routes: require('./routes')
});

var pluginConfig = {
        lambda: {
            role: 'arn:aws:iam::xxxxxxxxxx:role/root'
        },
        aws: {
            profile: config.aws.profile,
            region: 'us-east-1',
            IdentityPoolId: 'xxxxx'
        }
    };

require('api-deploy/plugins/local').register(deployer).configure(pluginConfig);
require('api-deploy/plugins/lambda').register(deployer).configure(pluginConfig);
require('api-deploy/plugins/apigateway').register(deployer).configure(pluginConfig);

module.exports = deployer;
```

## Now, you can deploy your API at API Gateway:

- `api deploy apigateway` - Deploy your API Gateway to AWS
- `api deploy apigateway /accounts /other {operationId}` - Deploy selected API Gateway routes (also deploys child/ancestor routes)
- `api deploy apigateway --sdk` - Deploy your API Gateway and generate a connected SDK

## Now, you can deploy your Lambdas with:

- `api deploy lambda` - Deploy your Lambdas to AWS
- `api deploy lambda /accounts /other {operationId}` - Deploy selected Lambdas (also deploys child/ancestor routes)
- `api deploy lambda --sdk` - Deploy your Lambdas and generate a connected SDK

## How can I test my code locally?

API Deploy comes with a local hapi server that functions like your API Gateway:

- `api deploy local` - Saves a hapi server at `./local.js`
- `api deploy local --serve --watch --sdk` - **Test your Lambdas @ http://localhost:8000 and generate a connected SDK!**
- `api deploy local -sw --sdk` - A shortform of the above

## You can also generate an SDK:

- `api sdk lambda` - Build an SDK that points to your AWS Lambdas (saved at `./sdk-lambda.js`)!
- - `api sdk apigateway` - Build an SDK that points to your API Gateway (saved at `./sdk-apigateway.js`)!
- `api sdk local` - Build a local server you can run with `node local` (saved at `./sdk-local.js`)!
- `api sdk local --prettify` - Build an SDK that is not minified

## Use an SDK by including (via Node or Script tag), then:

```
MyAPI.init( new AWS.Lambda() ); // Only required if using the Lambda SDK

MyAPI.accountsCreate({
    headers: {}, // HTTP Headers
    query: {}, // URL Get Params (eg. /?param=123)
    params: {}, // Dynamic URL segment params (eg. /accounts/{accountID})
    payload: {} // eg. POSTed Data
}, function(err, data) {
    console.log('Response from your API:', err, data);
});
```

## Want to see an example API?

[https://github.com/dallasread/api-deploy/tree/master/example-api](https://github.com/dallasread/api-deploy/tree/master/example-api)

# TODO
- Undeploy Resources
