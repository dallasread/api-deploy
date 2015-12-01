module.exports = {
    deployMethodRequest: function deployMethodRequest(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Request:', method.pathInfo);
        _.APIDeploy.logger.succeed('Deployed Method Request:', method.pathInfo);

        // do stuff

        done(null, method);
    },

    deployMethodResponse: function deployMethodResponse(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Response:', method.pathInfo);
        _.APIDeploy.logger.succeed('Deployed Method Response:', method.pathInfo);

        // do stuff

        done(null, method);
    },
};
