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
                _.APIDeploy.logger.warn(err);

                if (err.indexOf('any methods') !== -1) {
                    _.APIDeploy.logger.warn('No deployment was created for:', options.stage);
                }
            } else {
                _.APIDeploy.logger.succeed('Deployed deployment:', options.stage);
            }

            done(null, restapi);
        });
    }
};
