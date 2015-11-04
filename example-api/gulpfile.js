var gulp = require('gulp'),
    argv = require('yargs').argv,
    deployer = require('../').create({
        sdk: {
            path: ['./sdk.js'],
            url: 'http://api.amazing.com',
            name: 'MySampleAPI'
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

gulp.task('generate-sdk', function(done) {
    deployer.generateSDK(done);
});

gulp.task('deploy', function(done) {
    deployer.deploy(
        typeof argv.name === 'string' ? [argv.name] : argv.name,
        done
    );
});

gulp.task('deploy-lambdas', function(done) {
    deployer.deployLambdas(
        typeof argv.name === 'string' ? [argv.name] : argv.name,
        done
    );
});

gulp.task('generate-swagger', function(done) {
    deployer.generateSwagger({
        // regeneratePaths: true // This is dangerous - you'll lose your ARNs
    }, done);
});
