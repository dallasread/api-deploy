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

    getMethods: function getMethods(ids) {
        var _ = this,
            swagger = _.generateSwagger(),
            methods = [],
            path, resource, method, m, i;

        for (path in _.routes) {
            resource = _.routes[path];

            for (m in resource) {
                if (!/^x-/.test(m)) {
                    method = swagger.paths[path][m];

                    Object.defineProperty(method, '_path', {
                        enumerable: false,
                        value: path
                    });

                    methods.push(method);
                }
            }
        }

        if (ids) {
            var newMethods = [],
                n;

            for (i = 0; i < methods.length; i++) {
                method = methods[i];

                if (
                    (
                        ids.indexOf(method._path) !== -1
                    ) ||
                    (
                        method['x-amazon-lambda'] && (
                            ids.indexOf(method['x-amazon-lambda'].arn) !== -1 ||
                            ids.indexOf(method['x-amazon-lambda'].name) !== -1
                        )
                    ) ||
                    (
                        method['x-amazon-apigateway-integration'] && (
                            ids.indexOf(method['x-amazon-apigateway-integration'].uri) !== -1
                        )
                    )
                ) {
                    var children = _.findChildrenMethods(method._path, swagger.paths),
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

            methods = newMethods;
        }

        return methods;
    }
};
