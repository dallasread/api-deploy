var AWSRequest = require('./aws-request');

module.exports = {
    createRestAPIDeployment: function createRestAPIDeployment(options, done) {
        var _ = this,
            restAPI = _.cfg['x-apiDeploy'].restAPI;

        _.logger.log('Creating Deployment            - ' + options.stage);

        AWSRequest({
            path: '/restapis/' + restAPI.id + '/deployments',
            method: 'POST',
            body: {
                stageName: options.stage,
                cacheClusterEnabled: false
            }
        }, function(err, resource) {
            if (err) return done(err);

            _.logger.log('Created Deployment             - ' + options.stage);

            done();
        });
    }
};
