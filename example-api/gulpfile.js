var gulp = require('gulp'),
    deployer = require('../').create({
        sdk: {
            path: ['./sdk.js'],
            url: 'http://api.api-deploy.com',
            name: 'MySampleAPI',
            // templates: {
            //     js: require('fs').readFileSync('../lib/sdk/templates/js/lambda.hbs', { encoding: 'utf8' })
            // }
        },
        swagger: {
            path: './swagger.json'
        },
        routes: require('./routes.json'),
        defaults: {
            lambda: {
                role: 'arn:aws:iam::347191724861:role/Lambda'
            },
            aws: {
                region: 'us-east-1',
                profile: 'personal'
            }
        }
    });

deployer.registerTasks(gulp);
