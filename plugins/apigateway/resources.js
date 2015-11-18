var async = require('async'),
    Wrapper = require('../../utils/wrapper');

function getResourceID(resource) {
    return resource && resource.data &&
        resource.data['x-amazon-apigateway-resource'] &&
        resource.data['x-amazon-apigateway-resource'].id;
}

module.exports = {
    deployRestAPIResources: function deployRestAPIResources(done) {
        var _ = this;

        async.eachSeries(_.resources, function(resource, next) {
            _.deployRestAPIResource(resource, next);
        }, done);
    },

    deployRestAPIResource: function deployRestAPIResource(resource, done) {
        var _ = this;


        if (getResourceID(resource)) {
            _.updateRestAPIResource(resource, done);
        } else {
            var paths = _.APIDeploy.swagger.data.paths,
                parentPath = resource._path.replace(/\/$/, '').replace(/\/[^\/]+$/, ''),
                parent = _.findResource(parentPath);

            if (parent === resource) return done(null, resource);

            resource._parent = getResourceID(parent);

            if (resource._parent) {
                _.createRestAPIResource(resource, done);
            } else {
                if (!parent) {
                    paths[parentPath] = {};

                    parent = Wrapper.create(paths[parentPath], {
                        _path: parentPath
                    });
                }

                _.deployRestAPIResource(parent, function(err, parent) {
                    if (parent) {
                        resource._parent = parent.data['x-amazon-apigateway-resource'].id;
                        _.createRestAPIResource(resource, done);
                    } else {
                        done(null, resource);
                    }
                });
            }
        }
    },

    createRestAPIResource: function createRestAPIResource(resource, done) {
        var _ = this,
            pathSplat = resource._path.split('/'),
            pathPart = pathSplat[pathSplat.length - 1],
            path = resource._path,
            parent = resource._parent;

        _.APIDeploy.logger.log('Creating Resource              - ' + path);

        _.AWSRequest({
            path: '/restapis/' + _.APIDeploy.swagger.data['x-amazon-apigateway-restapi'].id + '/resources/' + resource._parent,
            method: 'POST',
            body: {
                pathPart: pathPart
            }
        }, function(err, r) {
            if (err) {
                _.APIDeploy.logger.error(err);
                return done(err);
            }

            resource.data['x-amazon-apigateway-resource'] = {
                id: r.id
            };

            resource._path = path;
            resource._parent = parent;

            _.APIDeploy.logger.log('Created Resource               - ' + path);

            done(null, resource);
        });
    },

    updateRestAPIResource: function updateRestAPIResource(resource, done) {
        var _ = this;

        _.APIDeploy.logger.log('Updating Resource              - ' + resource._path);
        _.APIDeploy.logger.log('Updated Resource               - ' + resource._path);

        done(null, resource);
    }
};
