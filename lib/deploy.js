var async = require('async'),
    fs = require('fs');

module.exports = {
    deploy: function deploy(lambdaName, done) {
        var _ = this,
            paths = _.cfg.paths,
            routes = [],
            key, path, m;

        for (key in paths) {
            path = paths[key];

            for (m in path) {
                routes.push(path[m]);
            }
        }

        _.logger.log('Deploying Lambdas');

        if (lambdaName) {
            var route, response;

            findRoute:
            for (key in routes) {
                route = routes[key];
                response = route.responses[200];

                if (
                    response && response.apiDeploy && (
                        response.operationId === lambdaName ||
                        response.apiDeploy.lambda.arn === lambdaName
                    )
                ) {
                    routes = [route];
                    break findRoute;
                }
            }

            if (routes.length !== 1) {
                _.logger.error('Lambda not found `' + lambdaName + '`');
                return done();
            }
        }

        async.each(routes, function(route, next) {
            _.deployLambda.call(_, route, next);
        }, function() {
            fs.writeFileSync(_.configPath, JSON.stringify(_.cfg, null, 4));
            _.logger.log('Deployed Lambdas');
            typeof done === 'function' && done();
        });
    }
};
