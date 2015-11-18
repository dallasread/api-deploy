module.exports = {
    createRestAPIDeployment: function createRestAPIDeployment(options, done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating Deployment            - ' + options.stage);

        _.AWSRequest({
            path: '/restapis/' + _.APIDeploy.swagger.data['x-amazon-apigateway-restapi'].id + '/deployments',
            method: 'POST',
            body: {
                stageName: options.stage,
                cacheClusterEnabled: false
            }
        }, function(err, resource) {
            if (err) return done(err);

            _.APIDeploy.logger.log('Created Deployment             - ' + options.stage);

            done();
        });
    }
};
