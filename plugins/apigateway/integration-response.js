module.exports = {
    deployIntegrationResponses: function deployIntegrationResponses(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Integration Response:', method.pathInfo);
        _.APIDeploy.logger.succeed('Deployed Integration Response:', method.pathInfo);

        // do stuff

        done(null, method);
    },
};
