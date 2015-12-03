try {
    require.resolve('aws-sdk');
    require.resolve('hapi');
} catch(e) {
    console.error('Unmet dependencies, please run:', 'npm install aws-sdk hapi');
    process.exit(e.code);
}

var Hapi = require('hapi'),
    server = new Hapi.Server(),
    AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1',
});

AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: 'default'
});

server.connection({
    host: 'localhost',
    port: 8000,
    routes: {
        cors: true
        // cors: {
        //     origin: ['*'],
        //     methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        //     exposedHeaders: ['authorization']
        // }
    }
});

(function () {
    var endpoint = require('./hello/world');

    server.route({
        method: 'get',
        path: '/hello',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = {
                    headers: request.headers,
                    payload: request.payload,
                    params: request.params,
                    query: request.query
                };

            endpoint.handler(event, context);
        }
    });
}());

(function () {
    var endpoint = require('./hello/there');

    server.route({
        method: 'patch',
        path: '/hello/there',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = {
                    headers: request.headers,
                    payload: request.payload,
                    params: request.params,
                    query: request.query
                };

            endpoint.handler(event, context);
        }
    });
}());

(function () {
    var endpoint = require('./hello/there');

    server.route({
        method: 'delete',
        path: '/hello/there',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = {
                    headers: request.headers,
                    payload: request.payload,
                    params: request.params,
                    query: request.query
                };

            endpoint.handler(event, context);
        }
    });
}());

(function () {
    var endpoint = require('./hello/world');

    server.route({
        method: 'post',
        path: '/hello/world',
        handler: function (request, reply) {
            var context = {
                    done: function(err, data) {
                        if (err) data = { error: err.message };
                        reply(null, data);
                    },
                    succeed: function(data) {
                        reply(null, data);
                    },
                    fail: function(err) {
                        reply(null, { error: err.message });
                    }
                },
                event = {
                    headers: request.headers,
                    payload: request.payload,
                    params: request.params,
                    query: request.query
                };

            endpoint.handler(event, context);
        }
    });
}());

server.start(function (err) {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});
