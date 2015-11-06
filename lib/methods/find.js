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

        if (typeof ids === 'string') ids = [ids];

        if (ids) {
            var newMethods = [],
                newResources = [],
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
                    var children = _._findChildrenMethods(method),
                        childMethod;

                    newMethods.push(method);

                    if (method._resource) {
                        newResources.push(method._resource);
                    }

                    for (n = children.length - 1; n >= 0; n--) {
                        childMethod = children[n];
                        newMethods.push(childMethod);

                        // if (childMethod._resource && newResources.indexOf(childMethod._resource) === -1) {
                        //     newResources.push(childMethod._resource);
                        // }
                    }
                }
            }

            _.methods = newMethods;
            // _.resources = newResources;
        }

        return _.methods;
    }
};
