var nestedSet = require('../../utils/nested-set'),
    async = require('async');

function isDeployed(restapi) {
    return restapi['x-apigateway'] && restapi['x-apigateway'].id;
}

module.exports = {
    deployRestAPI: function deployRestAPI(restapi, done) {
        var _ = this,
            funcs = [];

        if (isDeployed(restapi)) {
            funcs.push(function getRestAPI(next) {
                _.getRestAPI(restapi, function gotRestAPI(err, restapi) {
                    next(err, restapi);
                });
            });
        } else {
            funcs.push(function deployRestAPI(next) {
                _.createRestAPI(restapi, function deployedRestAPI(err, data) {
                    next(err, restapi);
                });
            });
        }

        funcs.push(function findRestAPIResources(next) {
            _.findRestAPIResources(restapi, function appliedGatewayIds(err, data) {
                next(err, restapi);
            });
        });

        async.series(funcs, function(err, data) {
            done(null, data);
        });
    },

    getRestAPI: function getRestAPI(restapi, done) {
        var _ = this;

        _.AWSRequest({
            path: '/restapis/' + restapi['x-apigateway'].id,
            method: 'GET'
        }, function(err, restAPI) {
            // console.log(restAPI);
            if (err) {
                _.APIDeploy.logger.warn(err);
                _.APIDeploy.logger.warn('Attempting to create Rest API...');

                delete restapi['x-apigateway'].id;

                return _.createRestAPI(restapi, function deployRestAPI(err, restapi) {
                    if (err) return done(err);
                    done(null, restapi);
                });
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

            nestedSet(restapi, 'x-apigateway.id', restAPI.id);

            _.APIDeploy.logger.succeed('Created Rest API.');
            _.APIDeploy.saveSwagger();

            done(null, restapi);
        });
    },

    findRestAPIResources: function findRestAPIResources(restapi, done) {
        var _ = this;

        _.APIDeploy.logger.log('Finding Rest API Resources...');

        _.AWSRequest({
            path: '/restapis/' + restapi['x-apigateway'].id + '/resources?limit=500&embed=1',
            method: 'GET'
        }, function(err, restAPI) {
            var resources = restAPI._embedded.item || [],
                resource;

            if (!(resources instanceof Array)) {
                resources = [resources];
            }

            for (var i = 0; i < resources.length; i++) {
                resource = resources[i];
                nestedSet(restapi, 'paths.' + resource.path + '.x-apigateway.id', resource.id);
            }

            done(null, restapi);
        });
    },
};
