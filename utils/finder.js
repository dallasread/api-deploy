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

    for (var i = 0; i < resourcePaths.length; i++) {
        resource = swagger.paths[resourcePaths[i]];

        for (key in resource) {
            deploy.methods.push(resource[key]);
        }
    }

    resourcePaths = generateResourcesAll(swagger, paths, resourcePaths);

    for (i = 0; i < resourcePaths.length; i++) {
        deploy.resources.push(swagger.paths[resourcePaths[i]]);
    }

    return deploy;
}

module.exports = {
    generateResources: generateResources,
    generateResourcesAll: generateResourcesAll,
    getChildrenResources: getChildrenResources,
    getAllChildrenResources: getAllChildrenResources,
    getAllResourcesToDeploy: getAllResourcesToDeploy
};

// var swag = {
//     paths: {
//         '/': {},
//         '/a': {},
//         '/a/1': {},
//         '/a/2': {},

//         '/b': {},
//         '/b/1': {},
//         '/b/1/a': {},
//         '/b/1/b': {},
//         '/b/1/c': {},
//         '/b/2': {},
//     }
// };
//
// console.log(JSON.stringify(getAllResourcesToDeploy(['/b/1']), null, 2));
