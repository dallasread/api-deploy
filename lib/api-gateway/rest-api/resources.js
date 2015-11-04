var async = require('async'),
    AWSRequest = require('../../utils/aws-request'),
    getRestAPIItemID = function() {};

module.exports = {
    deployRestAPIResources: function deployRestAPIResources(routes, done) {
        var _ = this;

        async.each(routes, function(route, done) {
            _.deployRestAPIResource(route, done);
        }, done);
    },

    deployRestAPIResource: function deployRestAPIResource(route, done) {
        var _ = this;

        if (getRestAPIItemID(route)) {
            _.updateRestAPIResource(route, done);
        } else {
            var parentPath = route['x-apiDeployPath'].replace(/\/$/, '').replace(/[^\/]+$/, ''),
                parent = _.cfg.paths[parentPath] || _.cfg.paths[parentPath + '/'];

            route['x-apiDeployParentID'] = getRestAPIItemID(parent);

            if (!parent) {
                _.cfg.paths[parentPath] = parent = {
                    'x-apiDeployPath': parentPath
                };
            }

            if (!route['x-apiDeployParentID']) {
                _.deployRestAPIResource(parent, function(parent) {
                    route['x-apiDeployParentID'] = parent.id;
                    _.createRestAPIResource(route, done);
                });
            } else {
                _.createRestAPIResource(route, done);
            }
        }
    },

    createRestAPIResource: function createRestAPIResource(route, done) {
        var _ = this,
            restAPI = _.cfg['x-apiDeploy'].restAPI,
            pathSplat = route['x-apiDeployPath'].replace(/\//g, '').split('/'),
            pathPart = pathSplat[pathSplat.length - 1];

        _.logger.log('Creating Resource              - ' + route['x-apiDeployPath']);

        AWSRequest({
            path: '/restapis/' + restAPI.id + '/resources/' + route['x-apiDeployParentID'],
            method: 'POST',
            body: {
                pathPart: pathPart
            }
        }, function(err, resource) {
            if (err) return done(err);

            route['x-apiDeploy'] = route['x-apiDeploy'] || {};
            route['x-apiDeploy'].restAPI = route['x-apiDeploy'].restAPI || {};
            route['x-apiDeploy'].restAPI.id = resource.id;

            _.logger.log('Created Resource               - ' + route['x-apiDeployPath']);

            done();
        });
    },

    updateRestAPIResource: function updateRestAPIResource(route, done) {
        var _ = this;

        _.logger.log('Updating Resource              - ' + route['x-apiDeployPath']);
        _.logger.log('Updated Resource               - ' + route['x-apiDeployPath']);

        done();
    }
};
