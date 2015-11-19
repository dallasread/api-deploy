try {
    require.resolve('aws-sdk');
    require.resolve('hapi');
} catch(e) {
    console.error('Unmet dependencies, please run:', 'npm install aws-sdk hapi');
    process.exit(e.code);
}

var AWS = require('aws-sdk'),
    Hapi = require('hapi'),
    server = new Hapi.Server();

AWS.config.update({
    region: 'us-east-1'
});

AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: 'default'
});

server.connection({
    host: 'localhost',
    port: 8000,
    routes: { cors: true }
});

(function () {
    var endpoint = require('./hello/world');

    server.route({
        method: 'GET',
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
                event = ('GET' === 'GET' ? request.query : request.payload) || {},
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());
(function () {
    var endpoint = require('./hello/world');

    server.route({
        method: 'POST',
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
                event = ('POST' === 'GET' ? request.query : request.payload) || {},
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());
(function () {
    var endpoint = require('./hello/there');

    server.route({
        method: 'DELETE',
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
                event = ('DELETE' === 'GET' ? request.query : request.payload) || {},
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());
(function () {
    var endpoint = require('./hello/there');

    server.route({
        method: 'PATCH',
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
                event = ('PATCH' === 'GET' ? request.query : request.payload) || {},
                key;

            for (key in request.headers) {
                event[key] = request.headers[key];
            }

            for (key in request.params) {
                event[key] = request.params[key];
            }

            endpoint.handler(event, context);
        }
    });
}());

server.start(function (err) {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});
