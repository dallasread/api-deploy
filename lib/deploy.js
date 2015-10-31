var async = require('async'),
    fs = require('fs');

module.exports = {
    deploy: function deploy(routeNames, done) {
        var _ = this;

        function deployRoutes() {
            _.deployRoutes(routeNames, done);
        }

        if (_.shouldDeployAPIGateway() && !_.hasDeployedAPIGateway()) {
            _.createAPIGateway(deployRoutes);
        } else {
            deployRoutes();
        }
    },

    deployRoutes: function deployRoutes(routeNames, done) {
        var _ = this,
            paths = _.cfg.paths,
            routes = [],
            key, path, m;

        if (typeof routeNames === 'string') {
            routeNames = routeNames.split(/[,\s]+/);
        }

        for (key in paths) {
            path = paths[key];

            for (m in path) {
                routes.push(path[m]);
            }
        }

        if (routeNames && routeNames.length) {
            var route,
                lambdasToDeploy = [];

            for (key in routes) {
                route = routes[key];

                if (
                    route && route['x-apiDeploy'] && (
                        routeNames.indexOf(route.operationId) !== -1 ||
                        routeNames.indexOf(route['x-apiDeploy'].lambda.arn) !== -1
                    )
                ) {
                    lambdasToDeploy.push(route);
                }
            }

            if (!lambdasToDeploy.length) {
                _.logger.error('Lambda not found `' + routeNames.join('`, `') + '`');
                return done();
            }

            routes = lambdasToDeploy;
        }

        _.logger.log('Deploying ' + routes.length + ' Route' + (routes.length === 1 ? '' : 's'));

        async.each(routes, function(route, next) {
            _.deployLambda.call(_, route, next);
        }, function(err, data) {
            fs.writeFileSync(_.configPath, JSON.stringify(_.cfg, null, 4));

            if (!err) {
                _.logger.log('Deployed ' + routes.length + ' Route' + (routes.length === 1 ? '' : 's'));
            }

            typeof done === 'function' && done();
        });
    }
};
