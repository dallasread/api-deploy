var merge = require('deepmerge'),
    async = require('async');

module.exports = {
    deployRestAPI: function deployRestAPI(args, options, done) {
        var _ = this;

        if (!options.stage) {
            return _.APIDeploy.logger.error('Please specify a stage with the --stage flag.');
        }

        _.APIDeploy.findMethods(args);

        if (!_.APIDeploy.methods.length) {
            return _.APIDeploy.logger.error('Methods not found `' + _.APIDeploy.methods.join('`, `') + '`');
        }

        async.series([
            function createOrUpdateRestAPI(next) {
                var exists = _.APIDeploy.swagger.data['x-amazon-apigateway-restapi'];

                if (exists && exists.id) {
                    _.updateRestAPI(next);
                } else {
                    _.createRestAPI(next);
                }
            },
            function deployRestAPIResources(next) {
                _.APIDeploy.findMethods(args);
                _.deployRestAPIResources(next);
            },
            function deployRestAPIMethods(next) {
                _.deployRestAPIMethods(next);
            },
            function deployRestAPIIntegrations(next) {
                _.deployRestAPIIntegrations(next);
            },
            function createRestAPIDeployment(next) {
                _.createRestAPIDeployment(options, next);
            },
            function saveSwagger(next) {
                _.APIDeploy.saveSwagger(next);
            }
        ], done);
    },

    createRestAPI: function createRestAPI(done) {
        var _ = this;

        _.APIDeploy.logger.log('Creating RestAPI');

        _.AWSRequest({
            path: '/restapis',
            method: 'POST',
            body: {
                name: _.sdk.name
            }
        }, function(err, restAPI) {
            if (err) return _.APIDeploy.logger.error(err);

            _.APIDeploy.swagger.data['x-amazon-apigateway-restapi'] = {
                id: restAPI.id
            };

            _.APIDeploy.logger.log('Finding root route for RestAPI');

            _.AWSRequest({
                path: '/restapis/' + restAPI.id + '/resources',
                method: 'GET'
            }, function(err, resources) {
                if (err) return _.APIDeploy.logger.error(err);

                _.APIDeploy.swagger.data.paths = merge(_.APIDeploy.swagger.data.paths, {
                    '/': {
                        'x-amazon-apigateway-resource': {
                            id: resources._embedded.item.id
                        }
                    }
                });

                _.APIDeploy.logger.log('Root route found for RestAPI');
                _.APIDeploy.logger.log('RestAPI created');

                done();
            });
        });
    },

    updateRestAPI: function updateRestAPI(done) {
        var _ = this;

        _.APIDeploy.logger.log('Updating RestAPI');
        _.APIDeploy.logger.log('Updated RestAPI');

        done();
    }
};
