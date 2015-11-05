var Wrapper = require('./wrapper');

module.exports = {
    findChildrenMethods: function findChildrenMethods(matchPath, routes) {
        var matchRegex = new RegExp('^' + matchPath + '[^$]'),
            children = [],
            route, path, m;

        for (path in routes) {
            if (matchRegex.test(path)) {
                route = routes[path];

                for (m in route) {
                    children.push(route[m]);
                }
            }
        }

        return children;
    },

    findMethods: function findMethods(ids) {
        var _ = this,
            path, resource, method, m, i, r;

        _.resources = [];
        _.methods = [];

        _.generateSwagger();

        for (path in _.swagger.data.paths) {
            _.resources.push(
                Wrapper.create(_.swagger.data.paths[path], {
                    _path: path
                })
            );
        }

        for (path in _.routes) {
            resource = _.routes[path];
            r = _.findResource(path);

            for (m in resource) {
                if (!/^x-/.test(m)) {
                    _.methods.push(
                        Wrapper.create(_.swagger.data.paths[path][m], {
                            _path: path,
                            _method: m.toUpperCase(),
                            _resource: r
                        })
                    );
                }
            }
        }

        if (ids) {
            var newMethods = [],
                n;

            for (i = 0; i < _.methods.length; i++) {
                method = _.methods[i];

                if (
                    (
                        ids.indexOf(method._path) !== -1
                    ) ||
                    (
                        ids.indexOf(method.data.operationId) !== -1
                    ) ||
                    (
                        method.data['x-amazon-lambda'] && (
                            ids.indexOf(method.data['x-amazon-lambda'].arn) !== -1
                        )
                    ) ||
                    (
                        method.data['x-amazon-apigateway-integration'] && (
                            ids.indexOf(method.data['x-amazon-apigateway-integration'].uri) !== -1
                        )
                    )
                ) {
                    var children = _.findChildrenMethods(method._path, _.swagger.data.paths),
                        childMethod;

                    newMethods.push(method);

                    for (n = children.length - 1; n >= 0; n--) {
                        childMethod = children[n];

                        if (newMethods.indexOf(childMethod) === -1) {
                            newMethods.push(childMethod);
                        }
                    }
                }
            }

            _.methods = newMethods;
        }

        return _.methods;
    }
};
