function isDeployed(restapi) {
    return restapi['x-apigateway'];
}

module.exports = {
    deployRestAPI: function deployRestAPI(restapi, done) {
        var _ = this,
            action = isDeployed(restapi) ? _.updateRestAPI : _.createRestAPI;

        _.APIDeploy.logger.log('Deploying Rest API...');

        action.call(_, restapi, function deployedRestAPI(err, data) {
            _.APIDeploy.logger.succeed('Deployed Rest API.');
            done(null, restapi);
        });
    },

    createRestAPI: function createRestAPI(restapi, done) {
        var _ = this;

        done();
    },

    updateRestAPI: function updateRestAPI(restapi, done) {
        var _ = this;

        done();
    }
};
