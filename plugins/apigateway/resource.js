var pluralize = require('pluralize'),
    async = require('async'),
    nestedSet = require('../../utils/nested-set'),
    Finder = require('../../utils/finder');

function isDeployed(resource) {
    return resource['x-apigateway'] && resource['x-apigateway'].id;
}

module.exports = {
    deployResources: function deployResources(resources, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying ' + Object.keys(resources).length + ' Resources...');

        async.eachSeries(resources, function(resource, next) {
            _.deployResource(resource, next);
        }, function(err) {
            var deployedCount = resources.filter(function(resource) { return resource.deployed; }).length;

            _.APIDeploy.logger.succeed('Deployed ' + deployedCount + ' ' + pluralize('Resource', deployedCount) + '.');

            done(null, resources);
        });
    },

    deployResource: function deployResource(resource, done) {
        var _ = this,
            funcs = [];

        if (isDeployed(resource)) {
            funcs.push(function getResource(next) {
                _.getResource(resource, next);
            });
        } else {
            funcs.push(function createResource(next) {
                _.createResource(resource, next);
            });
        }

        funcs.push(function findResourceMethods(next) {
            _.findResourceMethods(resource, next);
        });

        funcs.push(function deployMethods(next) {
            _.deployMethods(resource, next);
        });

        async.series(funcs, function(err, data) {
            if (err) {
                _.APIDeploy.logger.warn(err);
            }

            done(null, resource);
        });
    },

    getResource: function getResource(resource, done) {
        var _ = this;

        _.APIDeploy.logger.log('Finding Resource...', resource.pathInfo);

        _.AWSRequest({
            path: '/restapis/' + resource.restapi['x-apigateway'].id + '/resources/' + resource['x-apigateway'].id,
            method: 'GET'
        }, function(err, data) {
            if (err) {
                _.APIDeploy.logger.warn(err);
                _.APIDeploy.logger.warn('Attempting to create Resource...');

                delete resource['x-apigateway'].id;

                for (var method in resource) {
                    if (resource[method] && resource[method]['x-apigateway']) {
                        delete resource[method]['x-apigateway'].id;
                    }
                }

                return _.deployResource(resource, done);
            }

            resource.setHidden('deployed', true);

            _.APIDeploy.logger.succeed('Found Resource:', resource.pathInfo);

            done(null, resource);
        });
    },

    createResource: function createResource(resource, done) {
        var _ = this;

        if (!resource.parent) {
            var parent = Finder.findParent(resource.restapi, resource.path);

            resource.setHidden('parent', parent);

            if (!parent) {
                return done(['Could not find parent for:', resource.path]);
            }
        }

        if (!resource.parent['x-apigateway'] || !resource.parent['x-apigateway'].id) {
            return done(['Parent is not deployed for:', resource.path]);
        }

        _.APIDeploy.logger.log('Creating Resource:', resource.pathInfo);

        _.AWSRequest({
            path: '/restapis/' + resource.restapi['x-apigateway'].id + '/resources/' + resource.parent['x-apigateway'].id,
            method: 'POST',
            body: {
                pathPart: resource.path
                    .replace(/^.+\//g, '')
                    .replace(/^\//, '')
            }
        }, function(err, awsResource) {
            if (err) {
                _.APIDeploy.logger.warn(err);
                return done(err);
            }

            resource.setHidden('deployed', true);

            nestedSet(resource, 'x-apigateway.id', awsResource.id);

            _.APIDeploy.logger.succeed('Created Resource:', resource.pathInfo);

            done(null, resource);
        });
    },

    findResourceMethods: function findResourceMethods(resource, done) {
        var _ = this;

        _.APIDeploy.logger.log('Finding Resource Methods...');

        _.AWSRequest({
            path: '/restapis/' + resource.restapi['x-apigateway'].id +
                '/resources/' + resource['x-apigateway'].id +
                '?limit=500&embed=1',
            method: 'GET'
        }, function(err, awsResource) {
            var methods = awsResource._links['resource:methods'] || [],
                method;

            if (!(methods instanceof Array)) {
                methods = [methods];
            }

            for (var i = 0; i < methods.length; i++) {
                method = methods[i];

                nestedSet(resource, method.name.toLowerCase() + '.x-apigateway.id', method.name);
            }

            done(null, resource);
        });
    },
};
