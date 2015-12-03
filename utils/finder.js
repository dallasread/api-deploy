function generateResources(resourcePath) {
    var splitResourcePath = resourcePath.split('/'),
        arr = [];

    for (var i = 0; i < splitResourcePath.length; i++) {
        arr[i] = splitResourcePath.slice(0, i+1).join('/') || '/';
    }

    return arr;
}

function generateResourcesAll(swagger, resourcePaths, arr) {
    arr = arr || [];

    for (var i = 0; i < resourcePaths.length; i++) {
        var resources = generateResources(resourcePaths[i]);

        for (var j = 0; j < resources.length; j++) {
            if (arr.indexOf(resources[j]) === -1) {
                arr.push(resources[j]);
            }
        }
    }

    return arr.sort();
}

function getChildrenResources(swagger, resourcePath) {
    return Object.keys(swagger.paths).filter(function(item){
        return resourcePath === item ||
                resourcePath === '/' ||
                item.indexOf(resourcePath+'/') === 0;
    });
}

function getAllChildrenResources(swagger, paths, arr) {
    arr = arr || [];

    for (var i = 0; i < paths.length; i++) {
        var resources = getChildrenResources(swagger, paths[i]);

        for (var j = 0; j < resources.length; j++) {
            if (arr.indexOf(resources[j]) === -1) {
                arr.push(resources[j]);
            }
        }
    }

    return arr.sort();
}

function getAllResourcesToDeploy(swagger, paths) {
    var deploy = {
        resources: [],
        methods: []
    }, key, resource;

    var resourcePaths = getAllChildrenResources(swagger, paths);

    resourcePaths = generateResourcesAll(swagger, paths, resourcePaths);

    for (var i = 0; i < resourcePaths.length; i++) {
        resource = swagger.paths[resourcePaths[i]];

        for (key in resource) {
            deploy.methods.push(resource[key]);
        }
    }

    for (i = 0; i < resourcePaths.length; i++) {
        deploy.resources.push(swagger.paths[resourcePaths[i]]);
    }

    return deploy;
}

function findParent(swagger, path) {
    var parentPath = path.split('/').filter(function(item) {
        return item.length;
    });

    parentPath.pop();

    return swagger.paths['/' + parentPath.join('/')];
}

module.exports = {
    findParent: findParent,
    generateResources: generateResources,
    generateResourcesAll: generateResourcesAll,
    getChildrenResources: getChildrenResources,
    getAllChildrenResources: getAllChildrenResources,
    getAllResourcesToDeploy: getAllResourcesToDeploy
};
