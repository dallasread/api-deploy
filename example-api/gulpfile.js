var gulp = require('gulp'),
    argv = require('yargs').argv,
    deployer = require('../').create({
        sdk: {
            path: ['./sdk.json'],
            name: 'MySampleAPI'
        },
        swagger: {
            path: './swagger.json'
        },
        routes: require('./routes.json')
        // defaults: {
        //     lambda
        // }
    });

gulp.task('generate-sdk', function(done) {
    deployer.generateSDK(done);
});

gulp.task('deploy', function(done) {
    deployer.deploy(argv.name, done);
});

gulp.task('deploy-lambdas', function(done) {
    deployer.deployLambdas(argv.name ? [argv.name] : null, done);
});

gulp.task('generate-swagger', function(done) {
    deployer.generateSwagger({
        regeneratePaths: true
    }, done);
});
