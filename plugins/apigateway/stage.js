module.exports = {
    deployStage: function deployStage(restapi, options, done) {
        var _ = this;

        options.stage = options.stage || 'dev';

        _.APIDeploy.logger.log('Deploying stage:', options.stage);
        _.APIDeploy.logger.succeed('Deployed stage:', options.stage);

        // do stuff

        done(null, options.stage);
    }
};
