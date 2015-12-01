module.exports = {
    deployDeployment: function deployDeployment(restapi, options, done) {
        var _ = this;

        options.stage = options.stage || 'dev';

        _.APIDeploy.logger.log('Deploying deployment:', options.stage);

        _.AWSRequest({
            path: '/restapis/' + restapi['x-apigateway'].id + '/deployments',
            method: 'POST',
            body: {
                stageName: options.stage,
                // cacheClusterEnabled: false
            }
        }, function(err, resource) {
            if (err) {
                return done(err);
            }

            _.APIDeploy.logger.succeed('Deployed deployment:', options.stage);

            done();
        });
    }
};
