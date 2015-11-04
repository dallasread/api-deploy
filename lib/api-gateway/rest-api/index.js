var AWSRequest = require('../../utils/aws-request'),
    merge = require('deepmerge'),
    async = require('async');

module.exports = {
    deployRestAPI: function deployRestAPI(options, done) {
        var _ = this;

        if (!options.stage) {
            return done('Please specify a stage with the --stage flag.');
        }

        var methods = _.getMethods(options.ids);

        if (!methods.length) {
            return done('Methods not found `' + methods.join('`, `') + '`');
        }

        async.series([
            function createOrUpdateRestAPI(done) {
                var exists = _.swagger.data['x-amazon-apigateway-restapi'];

                if (exists && exists.id) {
                    _.updateRestAPI(done);
                } else {
                    _.createRestAPI(done);
                }
            },
            // function deployRestAPIResources(done) {
            //     _.deployRestAPIResources(options.routes, done);
            // },
            // function deployRestAPIMethods(done) {
            //     _.deployRestAPIMethods(methods, done);
            // },
            // function deployRestAPIIntegrations(done) {
            //     _.deployRestAPIIntegrations(methods, done);
            // },
            // function createRestAPIDeployment(done) {
            //     _.createRestAPIDeployment(options, done);
            // },
            function saveSwagger() {
                _.saveSwagger(done);
            }
        ], done);
    },

    createRestAPI: function createRestAPI(done) {
        var _ = this;

        _.logger.log('Creating RestAPI');

        AWSRequest({
            path: '/restapis',
            method: 'POST',
            body: {
                name: _.sdk.name
            }
        }, function(err, restAPI) {
            if (err) return _.logger.error(err);

            _.swagger.data['x-amazon-apigateway-restapi'] = {
                id: restAPI.id
            };

            _.logger.log('Finding root route for RestAPI');

            AWSRequest({
                path: '/restapis/' + restAPI.id + '/resources',
                method: 'GET'
            }, function(err, resources) {
                if (err) return _.logger.error(err);

                _.swagger.data.paths = merge(_.swagger.data.paths, {
                    '/': {
                        'x-amazon-apigateway-resource': {
                            id: resources._embedded.item.id
                        }
                    }
                });

                _.logger.log('Root route found for RestAPI');
                _.logger.log('RestAPI created');

                done();
            });
        });
    },

    updateRestAPI: function updateRestAPI(done) {
        var _ = this;

        _.logger.log('Updating RestAPI');
        _.logger.log('Updated RestAPI');

        done();
    }
};
