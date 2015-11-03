var gulp = require('gulp'),
    argv = require('yargs').argv,
    APIDeploy = require('../').create({
        sdk: {
            path: ['./sdk.json'],
            name: 'MySampleAPI'
        },
        swagger: {
            path: './swagger.json'
        },
        routes: require('./routes.json'),
        // templates: {
        //     swagger: {
        //         resource: '{"paths": {"{{path}}": {"{{downcase method}}": {}}}}'
        //     }
        // }
        // defaults: {
        //     lambda
        // }
    });

gulp.task('generate-sdk', function(done) {
    APIDeploy.generateSDK(done);
});

gulp.task('deploy', function(done) {
    APIDeploy.deploy(argv.name, done);
});

gulp.task('generate-swagger', function(done) {
    APIDeploy.generateSwagger({
        regeneratePaths: true
    }, done);
});
