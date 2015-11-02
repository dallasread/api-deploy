module.exports = function getAPIRouteResourceID(route) {
    return route &&
        route['x-apiDeploy'] &&
        route['x-apiDeploy'].restAPI &&
        route['x-apiDeploy'].restAPI.id;
};
