module.exports = {
    deployIntegrationRequest: function deployIntegrationRequest(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Integration Request:', method.pathInfo);
        _.APIDeploy.logger.succeed('Deployed Integration Request:', method.pathInfo);

        // do stuff

        done(null, method);
    },

    deployIntegrationResponse: function deployIntegrationResponse(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Integration Response:', method.pathInfo);
        _.APIDeploy.logger.succeed('Deployed Integration Response:', method.pathInfo);

        // do stuff

        done(null, method);
    },
};
