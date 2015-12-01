function setHiddenProperty(obj, key, val) {
    Object.defineProperty(obj, key, {
        enumerable: false,
        configurable: false,
        writable: true,
        value: val
    });
}

function createSetterForHiddenProperty(obj) {
    return setHiddenProperty(obj, 'setHidden', function(key, val) {
        setHiddenProperty(obj, key, val);
    });
}

module.exports = function wrapSwagger(swagger) {
    swagger = swagger || {};

    for (var resourcePath in swagger.paths) {
        var resource = swagger.paths[resourcePath];

        setHiddenProperty(resource, 'path', resourcePath);
        setHiddenProperty(resource, 'pathInfo', resourcePath);
        createSetterForHiddenProperty(resource);

        for (var httpMethod in resource) {
            var method = resource[httpMethod];

            if (typeof method === 'object') {
                setHiddenProperty(method, 'method', httpMethod);
                setHiddenProperty(method, 'path', resourcePath);
                setHiddenProperty(method, 'pathInfo', resourcePath + ' (' + httpMethod + ')');
                setHiddenProperty(method, 'resource', resource);
                createSetterForHiddenProperty(method);
            }
        }
    }

    return swagger;
};
