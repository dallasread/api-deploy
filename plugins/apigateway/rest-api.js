var nestedSet = require('../../utils/nested-set');

function isDeployed(restapi) {
    return restapi['x-apigateway'] && restapi['x-apigateway'].id;
}

module.exports = {
    deployRestAPI: function deployRestAPI(restapi, done) {
        var _ = this;

        if (isDeployed(restapi)) {
            _.getRestAPI(restapi, function gotRestAPI(err, restapi) {
                done(err, restapi);
            });
        } else {
            _.createRestAPI(restapi, function deployedRestAPI(err, data) {
                done(err, restapi);
            });
        }
    },

    getRestAPI: function getRestAPI(restapi, done) {
        var _ = this;

        _.AWSRequest({
            path: '/restapis/' + restapi['x-apigateway'].id,
            method: 'GET'
        }, function(err, restAPI) {
            if (err) {
                delete restapi['x-apigateway'].id;
                _.APIDeploy.logger.warn(err);
                _.APIDeploy.logger.warn('Attempting to create Rest API...');
                return _.deployRestAPI(restapi, done);
            }

            done(null, restapi);
        });
    },

    createRestAPI: function createRestAPI(restapi, done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating Rest API...');

        _.AWSRequest({
            path: '/restapis',
            method: 'POST',
            body: {
                name: _.sdk.name
            }
        }, function(err, restAPI) {
            if (err) return done(err);

            var rootResourceHref = restAPI._links['resource:create'].href,
                rootResourceId = rootResourceHref.substr(
                    rootResourceHref.lastIndexOf('/') + 1,
                    rootResourceHref.length - 1
                );

            nestedSet(restapi, 'paths./.x-apigateway.id', rootResourceId);

            restapi['x-apigateway'] = {
                id: restAPI.id
            };

            _.APIDeploy.logger.succeed('Created Rest API.');
            _.APIDeploy.saveSwagger();

            done(null, restapi);
        });
    }
};
