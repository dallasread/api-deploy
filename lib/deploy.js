var async = require('async'),
    fs = require('fs');

module.exports = {
    deploy: function deploy(options, done) {
        options = options || {};

        var _ = this;

        async.series([
            function deployLambdas(done) {
                _.deployLambdas(options.routes, done);
            },
            function buildRestAPI(done) {
                _.buildRestAPI(options, done);
            }
        ], function(err, data) {
            if (err) _.logger.error(new Error(err));
            done(null, data);
        });
    },

    findRoutes: function findRoutes(options) {
        var _ = this,
            paths = _.cfg.paths,
            routes = [],
            key, route, m;

        for (key in paths) {
            route = paths[key];

            route['x-apiDeployPath'] = key;
            route['x-apiDeployStage'] = options.stage;

            for (m in route) {
                if (m[0] !== 'x') {
                    route[m]['x-apiDeployPath'] = key;
                    route[m]['x-apiDeployMethod'] = m.toUpperCase();
                    route[m]['x-apiDeployStage'] = options.stage;
                    route[m]['x-apiDeployRoute'] = route;
                }
            }

            routes.push(route);
        }

        if (!options.routes) return routes;

        if (typeof options.routes === 'string') {
            options.routes = options.routes.split(/[,\s]+/);
        }

        if (options.routes && options.routes.length) {
            var routesToDeploy = [];

            for (key in routes) {
                route = routes[key];

                if (
                    route && route['x-apiDeploy'] && (
                        options.routes.indexOf(route.operationId) !== -1 ||
                        options.routes.indexOf(route['x-apiDeploy'].lambda.id) !== -1
                    )
                ) {
                    routesToDeploy.push(route);
                }
            }

            routes = routesToDeploy;
        }

        return routes;
    },

    cleanup: function cleanup(done) {
        var _ = this,
            key, m, route;

        _.logger.log('Cleaning up...');

        for (key in _.cfg.paths) {
            route = _.cfg.paths[key];

            delete route['x-apiDeployRoute'];
            delete route['x-apiDeployPath'];
            delete route['x-apiDeployStage'];
            delete route['x-apiDeployParentID'];
            delete route['x-apiDeployMethod'];

            for (m in route) {
                delete route[m]['x-apiDeployRoute'];
                delete route[m]['x-apiDeployPath'];
                delete route[m]['x-apiDeployStage'];
                delete route[m]['x-apiDeployParentID'];
                delete route[m]['x-apiDeployMethod'];
            }
        }

        fs.writeFileSync(_.configPath, JSON.stringify(_.cfg, null, 4));

        _.logger.log('Cleaned up.');

        done();
    }
};
