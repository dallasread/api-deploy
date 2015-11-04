var AWSRequest = require('../../utils/aws-request'),
    async = require('async'),
    getRestAPIItemID = function() {};

module.exports = {
    buildRestAPI: function buildRestAPI(options, done) {
        var _ = this,
            methods = [],
            route, key;

        if (!options.stage) {
            return done('Please specify a stage with the --stage flag.');
        }

        var routes = _.findRoutes({
            routes: options.routes
        });

        if (!routes.length) {
            return done('Lambda not found `' + routes.join('`, `') + '`');
        }

        options.routes = routes;

        for (var i = 0; i < options.routes.length; i++) {
            route = options.routes[i];

            for (key in route) {
                if (key[0] !== 'x') {
                    methods.push(route[key]);
                }
            }
        }

        async.series([
            function deployRestAPI(done) {
                _.deployRestAPI(done);
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

    deployRestAPI: function deployRestAPI(done) {
        var _ = this;

        if (getRestAPIItemID(_.cfg)) {
            _.updateRestAPI(done);
        } else {
            _.createRestAPI(done);
        }
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

            _.swagger.data['x-amazon-restapi'] = {
                id: restAPI.id
            };

            _.logger.log('Finding root route for RestAPI');

            AWSRequest({
                path: '/restapis/' + restAPI.id + '/resources',
                method: 'GET'
            }, function(err, resources) {
                if (err) return _.logger.error(err);

                var paths = _.swagger.data.paths;

                paths['/'] = paths['/'] || {};
                paths['/']['x-amazon-restapi'] = paths['/']['x-amazon-restapi'] || {};
                paths['/']['x-amazon-restapi'].id = resources._embedded.item.id;

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
