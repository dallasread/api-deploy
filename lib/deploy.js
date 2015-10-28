var async = require('async'),
    fs = require('fs');

module.exports = {
    deploy: function deploy(lambdaNames, done) {
        var _ = this,
            paths = _.cfg.paths,
            routes = [],
            key, path, m;

        if (typeof lambdaNames === 'string') {
            lambdaNames = lambdaNames.split(/[,\s]+/);
        }

        for (key in paths) {
            path = paths[key];

            for (m in path) {
                routes.push(path[m]);
            }
        }


        if (lambdaNames && lambdaNames.length) {
            var route,
                routesToDeploy = [];

            for (key in routes) {
                route = routes[key];

                if (
                    route && route.apiDeploy && (
                        lambdaNames.indexOf(route.operationId) !== -1 ||
                        lambdaNames.indexOf(route.apiDeploy.lambda.arn) !== -1
                    )
                ) {
                    routesToDeploy.push(route);
                }
            }

            if (!routesToDeploy.length) {
                _.logger.error('Lambda not found `' + lambdaNames.join('`, `') + '`');
                return done();
            }

            routes = routesToDeploy;
        }

        _.logger.log('Deploying ' + routes.length + ' Lambdas');

        async.each(routes, function(route, next) {
            _.deployLambda.call(_, route, next);
        }, function() {
            fs.writeFileSync(_.configPath, JSON.stringify(_.cfg, null, 4));
            _.logger.log('Deployed ' + routes.length + ' Lambdas');
            typeof done === 'function' && done();
        });
    }
};
