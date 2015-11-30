var async = require('async'),
    Finder = require('../../utils/finder');

module.exports = {
    deployAPIGateway: function deployAPIGateway(args, options, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying to API Gateway...');

        var deployable = Finder.getAllResourcesToDeploy(_.swagger.data, args);

        async.series([
            function deployRestAPI(next) {
                _.deployRestAPI(_.swagger.data, next);
            },
            function deployResources(next) {
                _.deployResources(deployable.resources, next);
            },
            function deployMethods(next) {
                _.deployMethods(deployable.methods, next);
            },
            function deployStage(next) {
                _.deployStage(_.swagger.data, options, next);
            }
        ], function(err, data) {
            if (err) return done(err);

            _.APIDeploy.logger.succeed('Deployed to API Gateway.');
        });
    }
};
