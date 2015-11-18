var Wrapper = require('./wrapper');

module.exports = {
    _findChildrenMethods: function _findChildrenMethods(method) {
        var _ = this,
            matchRegex = new RegExp('^' + method._path + '[^$]'),
            children = [],
            m;

        for (var i = 0; i < _.methods.length; i++) {
            m = _.methods[i];

            if (matchRegex.test(m._path) && m !== method) {
                children.push(m);
            }
        }

        return children;
    },

    findResource: function findResource(path) {
        var _ = this,
            resource;

        for (var i = 0; i < _.resources.length; i++) {
            resource = _.resources[i];

            if (
                resource._path === path ||
                resource._path === path + '/'
            ) {
                return resource;
            }
        }
    },

    findMethods: function findMethods(ids) {
        var _ = this,
            path, resource, method, m, i, r;

        if (typeof ids === 'string') ids = [ids];
        ids = ids || [];

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

            for (m in _.swagger.data.paths[path]) {
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

        if (ids.length) {
            var newMethods = [],
                newResources = [],
                n;

            for (i = 0; i < _.methods.length; i++) {
                method = _.methods[i];

                if (
                    (
                        _.doesMethodExistInPath(method._path, ids)
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
                    var children = _._findChildrenMethods(method),
                        childMethod;

                    newMethods.push(method);

                    if (method._resource) {
                        newResources.push(method._resource);
                    }

                    for (n = children.length - 1; n >= 0; n--) {
                        childMethod = children[n];
                        newMethods.push(childMethod);
                    }
                }
            }

            _.methods = newMethods;
            // _.resources = newResources;
        }

        return _.methods;
    },

    doesMethodExistInPath: function doesMethodExistInPath(path, paths) {
        for (var i = 0; i < paths.length; i++) {
            if (
                path.indexOf(paths[i]) === 0 &&
                (
                    !path[paths[i].length] ||
                     path[paths[i].length] === '/'
                )
            ) {
                return true;
            }
        }

        return false;
    }
};
