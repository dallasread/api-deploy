module.exports = {
    deployMethodRequest: function deployMethodRequest(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Request:', method.path);
        _.APIDeploy.logger.succeed('Deployed Method Request:', '');

        // do stuff

        done(null, method);
    },

    deployMethodResponse: function deployMethodResponse(method, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying Method Response:', method.path);
        _.APIDeploy.logger.succeed('Deploying Method Response:', '');

        // do stuff

        done(null, method);
    },
};
