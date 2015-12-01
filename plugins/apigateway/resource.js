function isDeployed(resource) {
    return resource['x-apigateway'] && resource['x-apigateway'].id;
}

module.exports = {
    deployResources: function deployResources(resources, done) {
        var _ = this;

        _.APIDeploy.logger.log('Deploying ' + Object.keys(resources).length + ' Resources...');

        _.APIDeploy.each(resources, function(resource, next) {
            _.deployResource(resource, next);
        }, function(err) {
            var deployedCount = resources.filter(function(resource) { return resource.deployed; }).length;

            _.APIDeploy.logger.succeed('Deployed ' + deployedCount + ' Resources.');

            done(null, resources);
        });
    },

    deployResource: function deployResource(resource, done) {
        var _ = this,
            action = isDeployed(resource) ? _.createResource : _.updateResource;

        _.APIDeploy.logger.log('Deploying Resource:', resource.pathInfo);

        action.call(_, resource, function deployedResource(err, data) {
            _.deployMethods(resource, function(err, methods) {
                _.APIDeploy.logger.succeed('Deployed Resource:', resource.pathInfo);

                done(null, resource);
            });
        });
    },

    createResource: function createResource(resource, done) {
        var _ = this;

        resource.setHidden('deployed', true);

        done();
    },

    updateResource: function updateResource(resource, done) {
        var _ = this;

        resource.setHidden('deployed', true);

        done();
    }
};
