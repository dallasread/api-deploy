# API Deploy

API Deploy is a Command Line Tool to publish your API. Currently, AWS Lambda is implemented, with API Gateway on the way. You can also export an SDK to use on the Web or Node (more platforms to come). Your SDK and Lambdas are both built based your project's `deployfile.js`.

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
- `api deploy apigateway` - Deploy your api to API Gateway
- `api deploy lambda /accounts /other {operationId}` - Deploy selected Lambdas (also deploys child routes)
- `api deploy lambda --sdk` - Deploy your Lambdas and build an SDK
- `api sdk lambda` - Build an SDK that points to your AWS Lambdas!
- `api sdk local` - Build a local server you can run with `node local`!
- `api sdk local --prettify` - Build an SDK that is not minified

## Use an SDK by including (via Node or Script tag):

```
MyAPI.accountsCreate(data, [headers], function(err, data) {
    console.log('Response from your API:', err, data);
});
```

## Want to see an example API?

[https://github.com/dallasread/api-deploy/tree/master/example-api](https://github.com/dallasread/api-deploy/tree/master/example-api)
