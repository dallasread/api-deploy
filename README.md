# API Deploy

API Deploy is a Command Line Tool to publish your API. Currently, AWS Lambda is implemented, with API Gateway on the way. You can also export an SDK to use on the Web or Node (more platforms to come). Your SDK and Lambdas are both built based your project's `deployfile.js`.

**API Gateway integration is coming soon!**

## To use API Deploy:

First, you'll need to `npm install api-deploy -g`. This gives you a new terminal command: `api`. Now, create a `deployfile.js` in your project:

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
        '/hello': {
            'get': './hello/world'
        },
        '/hello/world': {
            'post': './hello/world'
        },
        '/hello/there': {
            'patch': './hello/there',
            'delete': './hello/there'
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

module.exports = deployer;
```

## Now, you can run commands like:

- `api deploy lambda` - Deploy your Lambdas to AWS
- `api deploy lambda /accounts /other {operationId}` - Deploy selected Lambdas (also deploys child routes)
- `api deploy lambda --sdk` - Deploy your Lambdas and generate a connected SDK
- `api deploy local --serve --watch --sdk` - **Test your Lambdas @ http://localhost:8000 and generate a connected SDK!**
- `api deploy local -sw --sdk` - A shortform of the above
- `api sdk lambda` - Build an SDK that points to your AWS Lambdas!
- `api sdk local` - Build a local server you can run with `node local`!
- `api sdk local --prettify` - Build an SDK that is not minified

## Use an SDK by including (via Node or Script tag):

```
MyAPI.init(new AWS.Lambda()); // If using the Lambda SDK

MyAPI.accountsCreate({
    headers: {}, // HTTP Headers
    query: {}, // URL Get Params
    params: {}, // Dynamic URL segment params (eg. /accounts/{accountID})
    payload: {} // eg. POST Data
}, function(err, data) {
    console.log('Response from your API:', err, data);
});
```

## Want to see an example API?

[https://github.com/dallasread/api-deploy/tree/master/example-api](https://github.com/dallasread/api-deploy/tree/master/example-api)

# TODO
- remove status template
- Undeploy
