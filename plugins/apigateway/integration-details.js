module.exports = {
    deployIntegrationRequest: function deployIntegrationRequest(integration, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Integration Request:', '');
        _.APIDeploy.logger.succeed('Deployed Integration Request:', '');

        // do stuff

        done(null, integration);
    },

    deployIntegrationResponse: function deployIntegrationResponse(integration, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Integration Response:', '');
        _.APIDeploy.logger.succeed('Deployed Integration Response:', '');

        // do stuff

        done(null, integration);
    },
};
