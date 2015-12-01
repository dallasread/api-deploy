var async = require('async'),
    Finder = require('../../utils/finder');

module.exports = {
    deployAPIGateway: function deployAPIGateway(args, options, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying to API Gateway...');

        var deployable = Finder.getAllResourcesToDeploy(_.swagger.data, args.length ? args : ['/']);

        async.series([
            function deployRestAPI(next) {
                _.deployRestAPI(_.swagger.data, next);
            },
            function deployResources(next) {
                _.deployResources(deployable.resources, next);
            },
            function deployDeployment(next) {
                _.deployDeployment(_.swagger.data, options, next);
            }
        ], function(err, data) {
            if (err) {
                _.APIDeploy.logger.warn(err);
                return done(err);
            }

            _.APIDeploy.logger.succeed('Deployed to API Gateway.');

            done();
        });
    }
};
