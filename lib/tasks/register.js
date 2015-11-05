var argv = require('yargs').argv;

module.exports = {
    registerTasks: function registerTasks(gulp) {
        var _ = this;

        gulp.task('generate-swagger', function(done) {
            var options = {};

            if (argv.regeneratePaths) {
                options.regeneratePaths = true; // This is dangerous - you'll lose your ARNs
            }

            _.generateSwagger(options, done);
        });

        gulp.task('generate-sdk', function(done) {
            _.generateSDK(done);
        });

        gulp.task('deploy', function(done) {
            if (!argv.stage) {
                _.logger.error('Please supply a stage with --stage');
                return done();
            }

            _.deploy(
                {
                    stage: argv.stage,
                    ids: typeof argv.name === 'string' ? [argv.name] : argv.name
                },
                done
            );
        });

        gulp.task('deploy-lambdas', function(done) {
            _.deployLambdas(
                typeof argv.name === 'string' ? [argv.name] : argv.name,
                done
            );
        });

        gulp.task('deploy-restapi', function(done) {
            _.deployRestAPI(
                {
                    ids: typeof argv.name === 'string' ? [argv.name] : argv.name,
                    stage: argv.stage
                },
                done
            );
        });

        gulp.task('deploy-access-policies', function(done) {
            _.updateRestAPIAccessPolicies(
                typeof argv.name === 'string' ? [argv.name] : argv.name,
                done
            );
        });
    }
};
