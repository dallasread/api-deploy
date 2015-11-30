var async = require('async');

function isDeployed(resource) {
    return resource['x-apigateway'] && resource['x-apigateway'].id;
}

module.exports = {
    deployResources: function deployResources(resources, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying ' + Object.keys(resources).length + ' Resources...');

        async.each(resources, function(resource, next) {
            _.deployResource(resource, next);
        }, function(err) {
            _.APIDeploy.logger.succeed('Deployed ' + Object.keys(resources).length + ' Resources successfully.');

            done(null, resources);
        });
    },

    deployResource: function deployResource(resource, done) {
        var _ = this,
            action = isDeployed(resource) ? _.createResource : _.updateResource;

        _.APIDeploy.logger.log('Deploying Resource:', resource.path);

        action.call(_, resource, function deployedResource(err, data) {
            _.APIDeploy.logger.succeed('Deployed Resource:', resource.path);
            done(null, resource);
        });
    },

    createResource: function createResource(resource, done) {
        var _ = this;

        done();
    },

    updateResource: function updateResource(resource, done) {
        var _ = this;

        done();
    }
};
