var AWSRequest = require('../utils/aws-request');

module.exports = {
    createRestAPIDeployment: function createRestAPIDeployment(options, done) {
        var _ = this;

        _.logger.log('Creating Deployment            - ' + options.stage);

        AWSRequest({
            path: '/restapis/' + _.swagger.data['x-amazon-apigateway-restapi'].id + '/deployments',
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
