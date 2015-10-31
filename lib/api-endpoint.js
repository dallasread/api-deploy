module.exports = {
    deployAPIEndpoint: function deployAPIEndpoint(route, done) {
        var _ = this;

        if (!_.hasDeployedAPIGateway()) {
            _.logger.error('API Gateway does not exist for: ' + route.operationId);
            return done(true);
        }

        _.logger.log('Deploying Endpoint    - ' + route.operationId);

        if (route['x-apiDeploy'].apiGateway && route['x-apiDeploy'].apiGateway.arn) {
            _.updateAPIEndpoint(route, done);
        } else {
            _.createAPIEndpoint(route, done);
        }
    },

    createAPIEndpoint: function createAPIEndpoint(route, done) {
        var _ = this;

        if (!_.hasDeployedAPIGateway()) {
            return done('API Gateway does not exist for: ' + route.operationId);
        }

        _.logger.log('Creating Endpoint     - ' + route.operationId);
        _.logger.log('Created Endpoint      - ' + route.operationId);


        // http://docs.aws.amazon.com/apigateway/api-reference/link-relation/resource-create/#pathPart
        // POST /restapis/<restapi_id>/resources/<parent_id>
        // {
        //     "pathPart" : "String"
        // }

        // http://docs.aws.amazon.com/apigateway/api-reference/link-relation/method-by-http-method/
        // GET /restapis/<restapi_id>/resources/<resource_id>/methods/{http_method}

        // PUT /restapis/<restapi_id>/resources/<resource_id>/methods/{http_method}
        // {
        //   "authorizationType" : "String",
        //   "apiKeyRequired" : "Boolean",
        //   "requestParameters" : {
        //     "String" : "Boolean"
        //   },
        //   "requestModels" : {
        //     "String" : "String"
        //   }
        // }

        done();
    },

    updateAPIEndpoint: function updateAPIEndpoint(route, done) {
        var _ = this;

        if (!_.hasDeployedAPIGateway()) {
            _.logger.error('API Gateway does not exist for: ' + route.operationId);
            return done(true);
        }

        _.logger.log('Updating Endpoint     - ' + route.operationId);
        _.logger.log('Updated Endpoint      - ' + route.operationId);

        // http://docs.aws.amazon.com/apigateway/api-reference/link-relation/resource-update/
        // PATCH /restapis/<restapi_id>/resources/<resource_id>
        // {
        //   "patchOperations" : [ {
        //     "op" : "String",
        //     "path" : "String",
        //     "value" : "String",
        //     "from" : "String"
        //   } ]
        // }

        done();
    }
};
